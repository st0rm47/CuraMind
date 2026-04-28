# This file contains the API endpoints for doctor-related operations
# It defines routes for doctors to access their data and interact with the system.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from api.deps import require_doctor
from db.session import get_db
from models.user import User
from models.reports import Report
from models.notifications import Notification
from models.doctor_review import DoctorReview
from schemas.doctor import DoctorReviewRequest

router = APIRouter(prefix="/doctor", tags=["Doctor"])


# Add this endpoint to your existing doctor router (doctor.routes.py)
# All imports are already present in your file.

@router.get("/dashboard")
async def get_doctor_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_doctor),
):
    """
    Single endpoint for the doctor dashboard.
    Returns stats, pending cases, recently reviewed, and average risk per disease.
    """

    # ── 1. Aggregate counts ───────────────────────────────────────────────────
    total = (await db.execute(select(func.count(Report.id)))).scalar() or 0

    pending_count = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "pending")
    )).scalar() or 0

    reviewed_count = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "reviewed")
    )).scalar() or 0

    # ── 2. All predictions — for avg risks + high-risk count ──────────────────
    all_preds_result = await db.execute(
        select(Report.predictions).where(Report.predictions != {})
    )
    all_preds = [row[0] for row in all_preds_result if row[0]]

    def _score(val) -> float:
        """Normalise any prediction value to 0-100."""
        if isinstance(val, dict):
            s = float(val.get("probability", 0))
        else:
            s = float(val or 0)
        return round(s * 100 if s <= 1 else s, 2)

    # High risk = patient has at least one disease score >= 60
    high_risk_count = sum(
        1 for p in all_preds
        if isinstance(p, dict) and any(_score(v) >= 60 for v in p.values())
    )

    # Average risk per disease across all stored predictions
    diseases = ["diabetes", "hypertension", "heartDisease", "kidneyDisease", "liverDisease", "anemia"]
    valid_preds = [p for p in all_preds if isinstance(p, dict)]
    avg_risks = {
        d: round(sum(_score(p.get(d, 0)) for p in valid_preds) / len(valid_preds), 1)
           if valid_preds else 0
        for d in diseases
    }

    # ── 3. Pending cases (fetch 20 so frontend can sort by risk level) ─────────
    pending_result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
        )
        .where(Report.status == "pending")
        .order_by(Report.created_at.desc())
        .limit(20)
    )
    pending_reports = pending_result.scalars().all()

    # ── 4. Recently reviewed (last 5) ─────────────────────────────────────────
    recent_result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
        )
        .where(Report.status == "reviewed")
        .order_by(Report.created_at.desc())
        .limit(5)
    )
    recent_reports = recent_result.scalars().all()

    # ── 5. Shape each report ──────────────────────────────────────────────────
    def _shape(r: Report) -> dict:
        raw = r.predictions or {}
        norm_preds = {k: _score(v) for k, v in raw.items()} if isinstance(raw, dict) else {}

        conf = r.ensemble_confidence or 0
        if conf <= 1:
            conf = round(conf * 100, 1)

        return {
            "id":           r.id,
            "submitted_at": r.created_at.isoformat() if r.created_at else None,
            "status":       r.status,
            "risk_level":   r.risk_level,
            "patient_id":   r.patient_id,
            "patient_name": r.patient.name if r.patient else "Unknown",
            "result": {
                "predictions":         norm_preds,      # flat {disease: 0-100}
                "risk_level":          r.risk_level,
                "ensemble_confidence": conf,
                "models_used":         r.models_used if isinstance(r.models_used, list)
                                       else ([r.models_used] if r.models_used else []),
            },
            "doctor_review": {
                "doctor_name": r.doctor_review.doctor.name if r.doctor_review.doctor else None,
                "reviewed_at": r.doctor_review.reviewed_at.isoformat()
                               if r.doctor_review.reviewed_at else None,
                "diagnosis":   r.doctor_review.diagnosis,
            } if r.doctor_review else None,
        }

    return {
        "stats": {
            "total_assessments":  total,
            "pending":     pending_count,
            "reviewed":           reviewed_count,
            "high_risk_patients": high_risk_count,
        },
        "pending_cases":   [_shape(r) for r in pending_reports],
        "recent_reviewed": [_shape(r) for r in recent_reports],
        "average_risks":   avg_risks,
    }
    
# Endpoint for doctors to view their patient queue (recent assessments)
@router.get("/queue")
async def patient_queue(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_doctor),
    status_filter: str = "all",   
    page: int = 1,
    limit: int = 30,
):
    """All patient assessments, newest first, with optional status filter."""
    offset = (page - 1) * limit

    # Build the base query to fetch assessments with related patient and doctor review data
    query = select(Report).options(
        selectinload(Report.patient),
        selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
        selectinload(Report.follow_ups),
    )

    # Apply status filter to the query if specified (e.g., pending, reviewed, archived)
    if status_filter in ("pending", "reviewed", "archived"):
        query = query.where(Report.status == status_filter)

    # Count total assessments for pagination metadata
    count_q = select(func.count(Report.id))
    if status_filter in ("pending", "reviewed", "archived"):
        count_q = count_q.where(Report.status == status_filter)

    total = (await db.execute(count_q)).scalar()

    result = await db.execute(
        query.order_by(Report.created_at.desc()).offset(offset).limit(limit)
    )
    assessments = result.scalars().all()

    return {
        "items": [a.to_dict() for a in assessments],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }   

# Endpoint for doctors to submit a review for a patient's report.
@router.post("/review")
async def submit_review(
    body: DoctorReviewRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_doctor),
):

    # Fetch assessment
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review),
        )
        .where(Report.id == body.report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Report not found")
    if report.patient_id != body.patient_id:
        raise HTTPException(400, "Patient ID does not match report record")

    # Prevent duplicate reviews (upsert pattern)
    if report.doctor_review:
        # Update existing review
        review = report.doctor_review
        review.doctor_id = user.id
        review.diagnosis = body.diagnosis
        review.recommendations = body.recommendations
        review.risk_override = body.risk_override or {}
    else:
        review = DoctorReview(
            report_id=body.report_id,
            doctor_id=user.id,
            diagnosis=body.diagnosis,
            recommendations=body.recommendations,
            risk_override=body.risk_override or {}
        )
        db.add(review)

    report.status = "reviewed"

    # Notify patient
    db.add(Notification(
        user_id=report.patient_id,
        type="doctor_review",
        title=f"Doctor Review Complete — {user.name}",
        message=(
            f"{user.name} has completed your clinical assessment. "
            "Tap to view your diagnosis and recommendations."
        ),
        action_page="feedback",
        report_id=report.id,
    ))

    await db.commit()
    await db.refresh(review)

    return {"ok": True, "review_id": review.id}


# Endpoint for doctors to view all their corrections (overrides to AI risk scores) for ML feedback learning.
@router.get("/corrections")
async def get_corrections(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_doctor),
    page: int = 1,
    limit: int = 30,
):
    """
    All assessments where the doctor overrode at least one AI risk level.
    Used for ML feedback learning.
    """
    offset = (page - 1) * limit

    # Find reviews with non-empty risk_override
    result = await db.execute(
        select(DoctorReview)
        .options(
            selectinload(DoctorReview.report).selectinload(Report.patient),
            selectinload(DoctorReview.doctor),
        )
        .where(DoctorReview.risk_override != {})
        .order_by(DoctorReview.reviewed_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reviews = result.scalars().all()

    corrections = []
    for r in reviews:
        a = r.report
        for disease, override in r.risk_override.items():
            original_score = a.predictions.get(disease, 0) if a.predictions else 0
            corrections.append({
                "review_id": r.id,
                "report_id": a.id,
                "patient_name": a.patient.name if a.patient else "Unknown",
                "doctor_name": r.doctor.name if r.doctor else "Unknown",
                "disease": disease,
                "ai_score": original_score,
                "doctor_override": override,
                "reviewed_at": r.reviewed_at.isoformat(),
            })

    return {"corrections": corrections, "total": len(corrections)}



# Endpoint for doctors to view analytics and aggregate statistics for their dashboard.
@router.get("/analytics")
async def analytics(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_doctor),
):
    """Aggregate statistics for the doctor dashboard."""
    total = (await db.execute(select(func.count(Report.id)))).scalar()
    pending = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "pending")
    )).scalar()
    reviewed = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "reviewed")
    )).scalar()

    # Average risk scores across all assessments (using JSON field)
    # Note: For complex JSON aggregation you'd do this in a reporting query or Pandas
    # Here we fetch recent and compute in Python
    recent_result = await db.execute(
        select(Report.predictions)
        .where(Report.predictions != {})
        .limit(500)
    )
    all_preds = [row[0] for row in recent_result if row[0]]


    # Calculate average risks for each disease across all predictions
    diseases = ["diabetes", "hypertension", "heartDisease", "kidneyDisease", "liverDisease", "anemia"]
    valid_preds = [p for p in all_preds if isinstance(p, dict)]

    avg_risks = {
        d: round(sum(p.get(d, 0) for p in valid_preds) / len(valid_preds), 1)
        if valid_preds else 0
        for d in diseases
    }


    # Count high risk patients (any disease with risk >= 60)
    high_risk_count = 0
    for p in all_preds:
        if isinstance(p, dict):
            for v in p.values():
                if v >= 60:
                    high_risk_count += 1
                    break

    return {
        "total_assessments": total,
        "pending": pending,
        "reviewed": reviewed,
        "high_risk_patients": high_risk_count,
        "average_risks": avg_risks,
    }
