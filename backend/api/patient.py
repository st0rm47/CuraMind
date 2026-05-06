# This file contains the API endpoints for patient-related operations
# It defines routes for patients to access their data and interact with the system.

from datetime import datetime, timedelta
import json

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
from services.ml_engine import run_prediction

# Create a router for patient-related endpoints with a prefix and tags for documentation
router = APIRouter(prefix="/patient", tags=["Patient"])

# Endpoint for patients to view their dashboard with summary of assessments and trends
@router.get("/dashboard")
async def get_patient_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):

    # Latest assessment (full detail) 
    latest_result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.patient),
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
            selectinload(Report.follow_ups),
        )
        .where(Report.patient_id == user.id)
        .order_by(Report.created_at.desc(), Report.id.desc())
        .limit(1)
    )
    latest: Report | None = latest_result.scalar_one_or_none()
 
    # 2. Recent activity
    activity_result = await db.execute(
        select(
            Report.id,
            Report.created_at,
            Report.risk_level,
            Report.ensemble_confidence,
            Report.status,
        )
        .where(Report.patient_id == user.id)
        .order_by(Report.created_at.desc())
        .limit(5)
    )
    activity_rows = activity_result.all()
 
    # 3. Total count 
    count_result = await db.execute(
        select(func.count(Report.id)).where(Report.patient_id == user.id)
    )
    total_assessments: int = count_result.scalar() or 0
 
    # 4. Shape the response 
    def _shape_latest(r: Report) -> dict:
        return {
            "id":            r.id,
            "submitted_at":  r.created_at.isoformat() if r.created_at else None,
            "status":        r.status,
            "params": {
                "age":              r.age,
                "gender":           r.gender,
                "weight":           r.weight,
                "height":           r.height,
                "bmi":              r.bmi,
                "glucose":          r.glucose,
                "cholesterol":      r.cholesterol,
                "hemoglobin":       r.hemoglobin,
                "wbc_count":        r.wbc_count,
                "creatinine":       r.creatinine,
                "platelet_count":   r.platelet_count,
                "chest_pain_type":  r.chest_pain_type,
                "resting_ecg":      r.resting_ecg,
                "resting_bp":       r.resting_bp,
                "st_slope":         r.st_slope,
                "exercise_angina":  r.exercise_angina,
                "fasting_bs":       r.fasting_bs,
                "max_hr":           r.max_hr,
                "oldpeak":          r.oldpeak,
                "smoking_status":       r.smoking_status,
                "alcohol_consumption":       r.alcohol_consumption,
                "physical_activity":      r.physical_activity,
                "family_history":   r.family_history,
                "symptoms":         r.symptoms,
            },
            "result": {
                # predictions is stored as a dict like:
                # { "diabetes": 0.72, "heartDisease": 0.45, ... }
                "predictions":          r.predictions,
                "risk_level":           r.risk_level,
                "shap_values":          r.shap_values,
                "ensemble_confidence":  r.ensemble_confidence,
                "recommendations":      r.recommendations,
                "models_used":          r.models_used,
                "bmi":                  r.bmi,
            },
            "doctor_review": (
                {
                    "doctor_name":    r.doctor_review.doctor.name if r.doctor_review.doctor else None,
                    "reviewed_at":    r.doctor_review.reviewed_at.isoformat() if r.doctor_review.reviewed_at else None,
                    "diagnosis":      r.doctor_review.diagnosis,
                    "recommendations": r.doctor_review.recommendations,
                }
                if r.doctor_review else None
            ),
            "follow_ups": [
                {
                    "id": f.id,
                    "submitted_at": f.submitted_at.isoformat() if f.submitted_at else None,
                    "feeling": f.feeling,
                    "systolic_bp": f.systolic_bp,
                    "diastolic_bp": f.diastolic_bp,
                    "weight": f.weight,
                    "symptoms": f.symptoms,
                }
                for f in (r.follow_ups or [])
            ],
        }
 
    return {
        # Full latest assessment — null when patient has never submitted
        "latest": _shape_latest(latest) if latest else None,
 
        # Lightweight timeline items for "Recent Activity" card
        "activity": [
            {
                "id":          str(row.id),
                "submitted_at": row.created_at.isoformat() if row.created_at else None,
                "risk_level":  row.risk_level,
                "confidence":  row.ensemble_confidence,
                "status":      row.status,
            }
            for row in activity_rows
        ], 
        # Aggregate stats
        "total_assessments": total_assessments,
    }
    
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
        bmi = round(params.weight / ((params.height / 100) ** 2),2),
        
        glucose=params.glucose,
        cholesterol=params.cholesterol,
        hemoglobin=params.hemoglobin,
        creatinine=params.creatinine,
        wbc_count=params.wbc_count,
        platelet_count=params.platelet_count,
        
        chest_pain_type=params.chest_pain_type,
        resting_ecg=params.resting_ecg,
        resting_bp=params.resting_bp,
        st_slope=params.st_slope,
        exercise_angina=params.exercise_angina,
        fasting_bs=params.fasting_bs,
        max_hr=params.max_hr,
        oldpeak=params.oldpeak,
        
        smoking_status=params.smoking_status,
        alcohol_consumption=params.alcohol_consumption,
        physical_activity=params.physical_activity,
        family_history=params.family_history,
        symptoms=params.symptoms or "",
        
        # Ml predictions and results
        predictions=ml_result["prediction"],
        shap_values=ml_result["key_factors"],# Store SHAP values as JSON string
        ensemble_confidence=ml_result["confidence"],
        recommendations=ml_result["recommendations"],
        models_used=ml_result["model"],
        risk_level=ml_result["risk_level"],
        status="pending",
        
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

#  Endpoint for patients to view their latest assessment and recommendations
@router.get("/assessments/latest")
async def get_latest_prediction(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    
    cutoff_time = datetime.utcnow() - timedelta(minutes=30)
    result = await db.execute(
        select(Report)
        .where(
            Report.patient_id == user.id,
            Report.created_at >= cutoff_time   # 🔥 KEY FIX
        )
        .order_by(Report.created_at.desc(), Report.id.desc())
        .limit(1)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="No predictions found")

    

    if report.created_at < cutoff_time:
        raise HTTPException(status_code=404, detail="No active assessment session")

    return {
        "hasAssessment": True,
        "id": report.id,
        "predictions": report.predictions,
        "risk_level": report.risk_level,
        "risk_percentage": report.ensemble_confidence,
        "recommendations": report.recommendations,
        "models_used": report.models_used,
        "created_at": report.created_at,
    }
    
    
# Endpoint to get shap values for the latest assessment to show feature importance to the patient
@router.get("/assessments/latest/shap")
async def get_latest_shap(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    cutoff_time = datetime.utcnow() - timedelta(minutes=30)

    result = await db.execute(
        select(Report)
        .where(
            Report.patient_id == user.id,
            Report.created_at >= cutoff_time
        )
        .order_by(Report.created_at.desc(), Report.id.desc())
        .limit(1)
    )

    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="No recent prediction found"
        )

    if not report.shap_values:
        raise HTTPException(
            status_code=404,
            detail="No SHAP values available"
        )

    # Handle both JSON string and JSON column safely
    shap_data = report.shap_values
    if isinstance(shap_data, str):
        shap_data = json.loads(shap_data)

    return {
        "report_id": report.id,
        "shap_values": shap_data
    }
    

# Endpoint for patients to view their progress over time, including trends and history of assessments
@router.get("/progress")
async def get_patient_progress(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
    limit: int = 10,
):

    result = await db.execute(
        select(Report)
        .where(Report.patient_id == user.id)
        .order_by(Report.created_at.asc())   # oldest first for trend charts
        .limit(limit)
    )
    reports = result.scalars().all()

    if not reports:
        return {"trend_series": [], "history": [], "total": 0}

    def _score(val) -> float:
        """Normalise prediction value to 0-100."""
        if isinstance(val, dict):
            s = float(val.get("probability", 0))
        else:
            s = float(val or 0)
        return round(s * 100 if s <= 1 else s, 1)

    def _top_prediction(preds: dict) -> dict | None:
        """Return {disease, score, risk_level} for the highest-scoring disease."""
        if not isinstance(preds, dict) or not preds:
            return None
        best_key, best_val = max(preds.items(), key=lambda kv: _score(kv[1]))
        score = _score(best_val)
        if isinstance(best_val, dict):
            risk_level = best_val.get("risk_level") or _derive_risk(score)
            disease_name = best_val.get("disease_name", best_key)
        else:
            risk_level = _derive_risk(score)
            disease_name = best_key
        return {"disease": best_key, "disease_name": disease_name, "score": score, "risk_level": risk_level}

    def _derive_risk(score: float) -> str:
        if score >= 70: return "high"
        if score >= 40: return "medium"
        return "low"

    def _conf(r: Report) -> float:
        c = r.ensemble_confidence or 0
        return round(c * 100 if c <= 1 else c, 1)

    # Trend series (chronological, for sparklines) 
    trend_series = [
        {
            # Short label for x-axis: "Jan 24", "Feb 24", etc.
            "label": r.created_at.strftime("%b %d") if r.created_at else "—",
            "date":  r.created_at.isoformat() if r.created_at else None,
            # Six vitals
            "glucose":      r.glucose,
            "resting_bp":   r.resting_bp,
            "weight":       r.weight,
            "bmi":          round(r.bmi, 1) if r.bmi else None,
            "cholesterol":  r.cholesterol,
            "hemoglobin":   r.hemoglobin,
        }
        for r in reports
    ]

    # History table (latest first) 
    history = [
        {
            "id":           r.id,
            "submitted_at": r.created_at.isoformat() if r.created_at else None,
            "status":       r.status,
            # Key params snapshot
            "glucose":      r.glucose,
            "resting_bp":   r.resting_bp,
            "weight":       r.weight,
            "bmi":          round(r.bmi, 1) if r.bmi else None,
            "cholesterol":  r.cholesterol,
            "hemoglobin":   r.hemoglobin,
            # ML result
            "risk_level":        r.risk_level,
            "confidence":        _conf(r),
            "top_prediction":    _top_prediction(r.predictions or {}),
            "models_used_count": len(r.models_used) if isinstance(r.models_used, list) else 1,
            # Review info
            "reviewed": r.status == "reviewed",
        }
        for r in reversed(reports)   # latest first for the table
    ]

    return {
        "trend_series": trend_series,
        "history":      history,
        "total":        len(reports),
    }
    
    
# Endpoint for patients to view doctor's notes and recommendations for their reviewed assessments
@router.get("/doctor-notes")
async def get_doctor_notes(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
        )
        .where(
            Report.patient_id == user.id,
            Report.status == "reviewed",
        )
        .order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
 
    def _normalise_score(val) -> float:
        """Normalise prediction value to 0–100 regardless of storage format."""
        if isinstance(val, dict):
            s = float(val.get("probability", 0))
        else:
            s = float(val or 0)
        return round(s * 100 if s <= 1 else s, 1)
 
    def _shape(r: Report) -> dict:
        dr = r.doctor_review
        doc = dr.doctor if dr else None
 
        # Normalise AI predictions to flat {disease: score_0_100}
        raw_preds = r.predictions or {}
        ai_predictions = {}
        if isinstance(raw_preds, dict):
            for disease, val in raw_preds.items():
                score = _normalise_score(val)
                # Extract risk_level if nested dict, else derive from score
                if isinstance(val, dict):
                    risk_lvl = val.get("risk_level", None)
                    disease_name = val.get("disease_name", disease)
                else:
                    risk_lvl = None
                    disease_name = disease
                ai_predictions[disease] = {
                    "disease_name":  disease_name,
                    "probability":   score,
                    "risk_level":    risk_lvl,
                }
 
        return {
            "report_id":      r.id,
            "submitted_at":   r.created_at.isoformat() if r.created_at else None,
            "reviewed_at":    dr.reviewed_at.isoformat() if dr and dr.reviewed_at else None,
            "overall_risk":   r.risk_level,
            "confidence":     round(r.ensemble_confidence * 100, 1)
                              if r.ensemble_confidence and r.ensemble_confidence <= 1
                              else r.ensemble_confidence,
 
            # Doctor profile
            "doctor": {
                "id":             doc.id if doc else None,
                "name":           doc.name if doc else None,
                "speciality":     doc.speciality if doc else None,
                "license_number": doc.license_number if doc else None,
                "email":          doc.email if doc else None,
            } if doc else None,
 
            # AI predictions (normalised)
            "ai_predictions": ai_predictions,
 
            # Doctor overrides — only diseases where doctor changed the AI's call
            # Shape: { disease: { ai_risk: str, doctor_risk: str } }
            "risk_overrides": {
                disease: {
                    "ai_risk":     ai_predictions.get(disease, {}).get("risk_level"),
                    "doctor_risk": override_level,
                }
                for disease, override_level in (dr.risk_override or {}).items()
            } if dr else {},
 
            # Doctor's written review
            "diagnosis":        dr.diagnosis if dr else None,
            "recommendations":  dr.recommendations if dr else None,
            "follow_up_weeks":  dr.follow_up_weeks if dr else None,
        }
 
    return {
        "notes": [_shape(r) for r in reports],
        "total": len(reports),
    }
    
# Endpoint for patients to submit follow-up updates after doctor's review and track their follow-up status and history
@router.get("/followup-status")
async def get_followup_status(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    # Latest report (with doctor review if it exists)
    latest_result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.doctor_review)
                .selectinload(DoctorReview.doctor),
            selectinload(Report.follow_ups),
        )
        .where(Report.patient_id == user.id)
        .order_by(Report.created_at.desc())
        .limit(1)
    )
    report: Report | None = latest_result.scalar_one_or_none()

    if not report:
        return {"latest_report": None, "previous_followups": []}

    dr = report.doctor_review

    # Shape response
    shaped_report = {
        "id":           report.id,
        "submitted_at": report.created_at.isoformat() if report.created_at else None,
        "status":       report.status,
        "risk_level":   report.risk_level,
        "followup_cycle_active": dr is not None,
        "followup_submitted": len(report.follow_ups or []) > 0,
        "latest_followup": (
            sorted(report.follow_ups or [], key=lambda f: f.submitted_at)[-1].to_dict()
            if report.follow_ups else None
        ),
        "can_submit_followup": (
            report.status == "reviewed"
            and len(report.follow_ups or []) == 0
        ),
        # Doctor review fields needed for countdown
        "doctor_review": {
            "doctor_name":     dr.doctor.name if getattr(dr, "doctor", None) else None,
            "reviewed_at":     dr.reviewed_at.isoformat() if dr and dr.reviewed_at else None,
            "follow_up_weeks": dr.follow_up_weeks if dr else None,
            "diagnosis":       dr.diagnosis if dr else None,
        } if dr else None,
    }

    # Last 5 follow-ups, newest first
    sorted_followups = sorted(
        report.follow_ups or [],
        key=lambda f: f.submitted_at or datetime.min,
        reverse=True,
    )[:5]

    previous_followups = [f.to_dict() for f in sorted_followups]
    return {
        "latest_report":      shaped_report,
        "previous_followups": previous_followups,
    }


# Endpoint for patients to submit follow-up updates after doctor's review
@router.post("/followup/{report_id}")
async def submit_followup(
    report_id: str,
    body: FollowUpRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient),
):
    """Submit a follow-up update for an existing assessment."""

    # Fetch the report — eagerly load doctor_review
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.doctor_review).selectinload(DoctorReview.doctor),
            selectinload(Report.follow_ups)
        )
        .where(
            Report.id == report_id,
            Report.patient_id == user.id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Report not found or does not belong to you")

    # Block multiple follow-ups per report
    existing_followup = await db.execute(
        select(FollowUp).where(FollowUp.report_id == report.id)
    )
    existing = existing_followup.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Follow-up already submitted for this report"
        )

    # Save the follow-up
    followup = FollowUp(
        report_id    = report.id,
        glucose      = body.glucose,
        systolic_bp  = body.systolic_bp,
        diastolic_bp = body.diastolic_bp,
        weight       = body.weight,
        feeling      = body.feeling,
        symptoms     = body.symptoms or "",
    )
    db.add(followup)
    await db.flush()  # get ID for the new follow-up

    doctor_review = report.doctor_review
    doctor_id = getattr(doctor_review, "doctor_id", None) if doctor_review else None

    message = (
        f"{user.name} submitted a follow-up update. "
        f"Feeling: {body.feeling}. "
        f"{'Symptoms: ' + body.symptoms if body.symptoms else ''}"
    ).strip()

    existing_notif_result = await db.execute(
        select(Notification).where(
            Notification.report_id == report.id,
            Notification.type == "followup_submitted",
        ).limit(1)
    )
    already_notified = existing_notif_result.scalar_one_or_none() is not None

    if not already_notified:
        if doctor_id:
            db.add(Notification(
                user_id=doctor_id,
                type="followup_submitted",
                title=f"Follow-Up Update — {user.name}",
                message=message,
                action_page="doc-followups",
                report_id=report.id,
            ))
        else:
            # Fallback: notify all doctors if no specific doctor is assigned
            doctors_result = await db.execute(
                select(User).where(User.role == "doctor")
            )
            for doctor in doctors_result.scalars():
                db.add(Notification(
                    user_id=doctor.id,
                    type="followup_submitted",
                    title=f"Follow-Up Update — {user.name}",
                    message=message,
                    action_page="doc-followups",
                    report_id=report.id,
                ))

    await db.commit()