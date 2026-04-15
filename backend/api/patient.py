# This file contains the API endpoints for patient-related operations
# It defines routes for patients to access their data and interact with the system.

from fastapi import APIRouter, Depends, HTTPException, params
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
# from sqalchemy.orm import selectinload

from api.deps import get_current_user, require_patient
from db.session import get_db
from services.ml_engine import run_prediction
from models.user import User
from models.assessment import Assessment
from models.followup import FollowUp
from models.notifications import Notification
from schemas.patient import HealthParams
from schemas.followup import FollowUpCreate

# Create a router for patient-related endpoints with a prefix and tags for documentation
router = APIRouter(prefix="/patient", tags=["Patient"])

# Endpoint for patients to submit health data and receive a disease risk prediction
@router.post("/assess")
async def assess_health(
    params: HealthParams,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient)
):
    ml_result = run_prediction(params)

    # Save the assessment to the database
    assessment = Assessment(
        patient_id = user.id,
        
    
        # Change this later
        input_data=str(params.dict()),   # store full input as string
        model_used=ml_result["model_used"],

        prediction=ml_result["prediction"],
        risk_level=ml_result["risk_level"]
    )
    
    # Save the assessment to the database
    db.add(assessment)
    await db.flush()  # Ensure the assessment gets an ID
    
    # Notify doctor of new assessment
    doctors = await db.execute(select(User).where(User.role == "doctor"))
    
    # Create a notification for doctor about the new assessment
    for doctor in doctors.scalars().all():
        notification = Notification(
            user_id=doctor.id,
            type = "new assessment",
            title = "New Patient Assessment",
            message=f"New assessment submitted by {user.name} with risk level {ml_result['risk_level']}.",
            related_assessment_id=assessment.id
        )
        db.add(notification)
    
    await db.commit()
    return {
        "assessment_id": assessment.id,
        "prediction": ml_result["prediction"],
        "risk_level": ml_result["risk_level"]
    }
    
    
# Endpoint for patients to view their assessment history
@router.get("/history")
async def get_assessment_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient)
):
    assessments = await db.execute(select(Assessment).where(Assessment.patient_id == user.id).order_by(Assessment.created_at.desc()))
    return assessments.scalars().all()


# Endpoint for patient to submit their follow-up actions after receiving recommendations
@router.post("/followup/{assessment_id}")
async def submit_followup(
    assessment_id: str,
    data: FollowUpCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):

    followup = FollowUp(
        assessment_id=assessment_id,
        user_id=user.id,
        message=data.message,
        status="pending"
    )

    db.add(followup)
    await db.commit()

    return {
        "message": "Follow-up submitted successfully",
        "followup_id": followup.id
    }
    
    
# Endpoint for patients to view their follow-up recommendations
@router.get("/followup/{assessment_id}")
async def get_followups(
    assessment_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):

    result = await db.execute(
        select(FollowUp)
        .where(
            FollowUp.assessment_id == assessment_id,
            FollowUp.user_id == user.id
        )
        .order_by(FollowUp.created_at.desc())
    )

    followups = result.scalars().all()

    return [
        {
            "id": f.id,
            "message": f.message,
            "status": f.status,
            "created_at": f.created_at
        }
        for f in followups
    ]