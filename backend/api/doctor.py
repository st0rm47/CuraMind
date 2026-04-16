# This file contains the API endpoints for doctor-related operations
# It defines routes for doctors to access their data and interact with the system.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.deps import get_current_user, require_doctor
from db.session import get_db
from models.user import User
from models.assessment import Assessment
from models.notifications import Notification
from models.doctor_review import DoctorReview
from schemas.doctor import DoctorReviewRequest, DoctorReviewResponse, DoctorQueueResponse, AssessmentItem   

router = APIRouter(prefix="/doctor", tags=["Doctor"])

# Endpoint for doctors to view their patient queue (recent assessments)
@router.get("/queue")
async def patient_queue(
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_doctor)
):
    # Get recent assessments for this doctor (for simplicity, we get all assessments)
    result = await db.execute(
        select(Assessment)
        .where(Assessment.status == "pending")
        .order_by(Assessment.created_at.desc())
    )
    
    assessments = result.scalars().all()

    return DoctorQueueResponse(
        count=len(assessments),
        items=[
            AssessmentItem(
                id=a.id,
                patient_id=a.patient_id,
                prediction=a.prediction,
                risk_level=a.risk_level,
                created_at=str(a.created_at)
            )
            for a in assessments
        ]
    )

# Endpoint for doctors to submit a review for an assessment
@router.post("/review/{assessment_id}", response_model=DoctorReviewResponse)
async def submit_review(
    assessment_id: str,
    review_request: DoctorReviewRequest,
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_doctor)
):
    # Check if the assessment exists
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Create a new doctor review
    doctor_review = DoctorReview(
        assessment_id=assessment_id,
        doctor_id=doctor.id,
        verdict=review_request.status,
        notes=review_request.notes
    )
    
    db.add(doctor_review)
    
    # Create a notification for the patient about the review outcome
    notification = Notification(
        user_id=assessment.patient_id,
        type = "doctor_review",
        title = "Assessment Review Update",
        message=f"Your assessment has been reviewed by Dr. {doctor.name}. Status: {review_request.status}"
    )
    db.add(notification)
    
    # Update the assessment status based on the doctor's review
    assessment.status = review_request.status
    await db.commit()
    
    return DoctorReviewResponse(
        assessment_id=assessment_id,
        doctor_id=doctor.id,
        notes=review_request.notes,
        status=review_request.status,
        message="Review submitted successfully"
    )


@router.get("/analytics")
async def analytics(
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_doctor)
):
    # For simplicity, we return some basic analytics about the doctor's assessments
    result = await db.execute(
        select(Assessment)
        .where(Assessment.doctor_id == doctor.id)
    )
    
    assessments = result.scalars().all()
    
    total_assessments = len(assessments)
    high_risk_count = sum(1 for a in assessments if a.risk_level == "high")
    medium_risk_count = sum(1 for a in assessments if a.risk_level == "medium")
    low_risk_count = sum(1 for a in assessments if a.risk_level == "low")
    
    return {
        "total_assessments": total_assessments,
        "high_risk_count": high_risk_count,
        "medium_risk_count": medium_risk_count,
        "low_risk_count": low_risk_count
    }
    

@router.get("/corrections")
async def corrections(
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_doctor)
):
    # Get assessments that have been reviewed by the doctor but are pending patient feedback
    result = await db.execute(
        select(Assessment)
        .where(Assessment.doctor_id == doctor.id)
        .where(Assessment.status == "pending")
    )
    
    assessments = result.scalars().all()
    
    return {
        "count": len(assessments),
        "items": [
            {
                "id": a.id,
                "patient_id": a.patient_id,
                "prediction": a.prediction,
                "risk_level": a.risk_level,
                "created_at": str(a.created_at)
            }
            for a in assessments
        ]
    }
    
