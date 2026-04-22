# This file contains the API endpoints for patient-related operations
# It defines routes for patients to access their data and interact with the system.

from fastapi import APIRouter, Depends, HTTPException, params
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from api.deps import get_current_user, require_patient
from db.session import get_db
from services.ml_engine import run_prediction
from models.user import User
from models.reports import Report
from models.followup import FollowUp
from models.notifications import Notification
from models.doctor_review import DoctorReview
from schemas.patient import HealthParams
from schemas.followup import  FollowUpRequest

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
    report = Report(
        patient_id=user.id,
        age=params.age,
        gender=params.gender,
        weight=params.weight,
        height=params.height,
        bmi=params.bmi,
        glucose=params.glucose,
        systolic_bp=params.systolic_bp,
        diastolic_bp=params.diastolic_bp,
        cholesterol=params.cholesterol,
        hemoglobin=params.hemoglobin,
        creatinine=params.creatinine,
        wbc_count=params.wbc_count,
        platelet_count=params.platelet_count,
        smoking_status=params.smoking_status,
        alcohol_consumption=params.alcohol_consumption,
        physical_activity=params.physical_activity,
        family_history=params.family_history,
        symptoms=params.symptoms or "",
        predictions=ml_result["predictions"],
        shap_values=ml_result["shap_values"],
        ensemble_confidence=ml_result["ensemble_confidence"],
        status="pending_review"
    )       
    
    # Save the assessment to the database
    db.add(report)
    await db.flush()  # Ensure the assessment gets an ID
    
    # Notify doctor of new assessment
    doctors = await db.execute(select(User).where(User.role == "doctor"))
    
    # Create a notification for doctor about the new assessment
    for doctor in doctors.scalars().all():
        notification = Notification(
            user_id=doctor.id,
            type = "new Report",
            title = "New Patient Report - " + user.name,
            message=f"New report submitted by {user.name} with risk level {ml_result['risk_level']}.",
            action_page="doc-review",
            report_id=report.id
        )
        db.add(notification)
    
    await db.commit()
    
    # Reload with relationships for serialization
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
            selectinload(Report.follow_ups),
        )
        .where(Report.id == report.id)
    )
    a = result.scalar_one()
    return a.to_dict()
    
    
# Endpoint for patients to view their assessment history
@router.get("/history")
async def get_get_reports(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
    page: int = 1,
    limit: int = 20,
):
    """Paginated assessment history for the authenticated patient."""
    offset = (page - 1) * limit

    # Total count
    count_result = await db.execute(
        select(func.count(Report.id)).where(Report.patient_id == user.id)
    )
    total = count_result.scalar()

    # Fetch page
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
            selectinload(Report.follow_ups),
        )
        .where(Report.patient_id == user.id)
        .order_by(Report.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reports = result.scalars().all()

    return {
        "items": [a.to_dict() for a in reports],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }

# Endpoint for patient to submit their follow-up actions after receiving recommendations
@router.post("/followup/{report_id}")
async def submit_followup(
    report_id: str,
    body: FollowUpRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    """Submit a follow-up update for an existing assessment."""
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.doctor_review))
        .where(
            Report.id == report_id,
            Report.patient_id == user.id,   # ensure ownership
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Report not found or does not belong to you")

    followup = FollowUp(
        report_id=report.id,
        glucose=body.glucose,
        systolic_bp=body.systolic_bp,
        diastolic_bp=body.diastolic_bp,
        weight=body.weight,
        feeling=body.feeling,
        symptoms=body.symptoms or "",
    )
    db.add(followup)

    # Notify doctor if assessment has been reviewed
    if report.doctor_review:
        # Find original reviewing doctor
        db.add(Notification(
            user_id=report.doctor_review.doctor_id,
            type="followup_submitted",
            title=f"Follow-Up — {user.name}",
            message=f"{user.name} submitted a follow-up update. Feeling: {body.feeling}.",
            action_page="doc-review",
            report_id=report.id,
        ))

    await db.commit()
    return {"ok": True, "followup_id": followup.id}
