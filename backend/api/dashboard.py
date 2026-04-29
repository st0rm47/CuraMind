# This file contains the API endpoints for the dashboard, which is used by doctors and administrators to view and manage patient assessments and reports.

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
router = APIRouter(prefix="/patient", tags=["Dashboard"])

@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_patient)
):
    # Fetch all assessments for the current patient, ordered by creation date
    result = await db.execute(
        select(Report)
        .where(Report.patient_id == current_user.id)
        .order_by(Report.created_at.desc())
    )
    assessments = result.scalars().all()
    
    # Calculate summary statistics for the dashboard
    total = len(assessments)

    high = sum(1 for a in assessments if a.risk_level == "high")
    moderate = sum(1 for a in assessments if a.risk_level == "moderate")
    low = sum(1 for a in assessments if a.risk_level == "low")

    latest = assessments[0] if assessments else None

    # ── Trend (last 10) ──
    trend = [
        {
            "date": a.created_at.date(),
            "score": a.score
        }
        for a in assessments[:10]
    ]

    # ── Recent (last 5) ──
    recent = [
        {
            "id": a.id,
            "risk_level": a.risk_level,
            "score": a.score,
            "created_at": a.created_at
        }
        for a in assessments[:5]
    ]

    return {
        "summary": {
            "total_assessments": total,
            "high_risk_count": high,
            "moderate_risk_count": moderate,
            "low_risk_count": low
        },
        "latest_assessment": {
            "id": latest.id,
            "risk_level": latest.risk_level,
            "score": latest.score,
            "created_at": latest.created_at
        } if latest else None,
        "risk_trend": trend,
        "recent_assessments": recent
    }