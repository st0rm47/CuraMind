
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, EmailStr
from typing import Optional

from api.deps import require_admin         
from db.session import get_db
from models.user import User
from models.reports import Report
from models.doctor_review import DoctorReview
from models.followup import FollowUp
from core.security import hash_password
from schemas.admin import RegisterDoctorRequest, DoctorResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

def _score(val) -> float:
    """Normalise any prediction value to 0-100 — mirrors doctor.py."""
    if isinstance(val, dict):
        s = float(val.get("probability", 0))
    else:
        s = float(val or 0)
    return round(s * 100 if s <= 1 else s, 2)


def _shape_doctor(doc: User, review_count: int) -> dict:
    return {
        "id":             doc.id,
        "name":           doc.name,
        "email":          doc.email,
        "speciality":     getattr(doc, "speciality",     None),
        "license_number": getattr(doc, "license_number", None),
        "phone":          getattr(doc, "phone",          None),
        "created_at":     doc.created_at.isoformat() if doc.created_at else None,
        "total_reviews":  review_count,
        "is_active":      getattr(doc, "is_active", True),
    }


def _shape_patient(pat: User, assessment_count: int, latest_risk: Optional[str]) -> dict:
    return {
        "id":                pat.id,
        "name":              pat.name,
        "email":             pat.email,
        "phone":             getattr(pat, "phone", None),
        "created_at":        pat.created_at.isoformat() if pat.created_at else None,
        "total_assessments": assessment_count,
        "latest_risk":       latest_risk,
    }


# ── GET /admin/stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def get_admin_stats(
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(require_admin),
):
    """Platform-wide statistics for the admin overview tab."""

    patient_count = (await db.execute(
        select(func.count(User.id)).where(User.role == "patient")
    )).scalar_one() or 0

    doctor_count = (await db.execute(
        select(func.count(User.id)).where(User.role == "doctor")
    )).scalar_one() or 0

    admin_count = (await db.execute(
        select(func.count(User.id)).where(User.role == "admin")
    )).scalar_one() or 0

    total_users = (await db.execute(
        select(func.count(User.id))
    )).scalar_one() or 0

    total_assessments = (await db.execute(
        select(func.count(Report.id))
    )).scalar_one() or 0

    # Match doctor.py: pending uses status == "pending"
    pending_assessments = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "pending")
    )).scalar_one() or 0

    reviewed_assessments = (await db.execute(
        select(func.count(Report.id)).where(Report.status == "reviewed")
    )).scalar_one() or 0

    # High-risk: mirrors doctor dashboard logic exactly
    all_preds_result = await db.execute(
        select(Report.predictions).where(Report.predictions != {})
    )
    all_preds = [row[0] for row in all_preds_result if row[0]]
    high_risk_count = sum(
        1 for p in all_preds
        if isinstance(p, dict) and any(_score(v) >= 60 for v in p.values())
    )

    # New users this month
    now = datetime.now(timezone.utc)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    new_patients_this_month = (await db.execute(
        select(func.count(User.id)).where(
            and_(User.role == "patient", User.created_at >= first_of_month)
        )
    )).scalar_one() or 0

    new_doctors_this_month = (await db.execute(
        select(func.count(User.id)).where(
            and_(User.role == "doctor", User.created_at >= first_of_month)
        )
    )).scalar_one() or 0

    total_followups = (await db.execute(
        select(func.count(FollowUp.id))
    )).scalar_one() or 0

    return {
        "total_users":             total_users,
        "patient_count":           patient_count,
        "doctor_count":            doctor_count,
        "admin_count":             admin_count,
        "new_patients_this_month": new_patients_this_month,
        "new_doctors_this_month":  new_doctors_this_month,
        "total_assessments":       total_assessments,
        "pending_assessments":     pending_assessments,
        "reviewed_assessments":    reviewed_assessments,
        "high_risk_count":         high_risk_count,
        "total_followups":         total_followups,
    }


# GET /admin/doctors 
@router.get("/doctors")
async def get_doctors(
    db:     AsyncSession = Depends(get_db),
    user:   User         = Depends(require_admin),
    page:   int          = Query(1,  ge=1),
    limit:  int          = Query(20, ge=1, le=100),
    search: str          = Query(""),
):
    """Paginated doctor list with per-doctor review counts (no N+1)."""
    offset = (page - 1) * limit

    base = select(User).where(User.role == "doctor")
    if search.strip():
        term = f"%{search.strip()}%"
        base = base.where(User.name.ilike(term) | User.email.ilike(term))

    total = (await db.execute(
        select(func.count()).select_from(base.subquery())
    )).scalar_one() or 0

    result = await db.execute(
        base.order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    doctors = result.scalars().all()

    doctor_ids = [d.id for d in doctors]
    if doctor_ids:
        rc_result = await db.execute(
            select(DoctorReview.doctor_id, func.count(DoctorReview.id))
            .where(DoctorReview.doctor_id.in_(doctor_ids))
            .group_by(DoctorReview.doctor_id)
        )
        review_counts = dict(rc_result.all())
    else:
        review_counts = {}

    return {
        "doctors": [_shape_doctor(d, review_counts.get(d.id, 0)) for d in doctors],
        "total":   total,
        "page":    page,
        "pages":   max(1, -(-total // limit)),
    }


# GET /admin/patients 

@router.get("/patients")
async def get_patients(
    db:     AsyncSession = Depends(get_db),
    user:   User         = Depends(require_admin),
    page:   int          = Query(1,  ge=1),
    limit:  int          = Query(20, ge=1, le=100),
    search: str          = Query(""),
):
    """Paginated patient list with assessment counts and latest risk."""
    offset = (page - 1) * limit

    base = select(User).where(User.role == "patient")
    if search.strip():
        term = f"%{search.strip()}%"
        base = base.where(User.name.ilike(term) | User.email.ilike(term))

    total = (await db.execute(
        select(func.count()).select_from(base.subquery())
    )).scalar_one() or 0

    result = await db.execute(
        base.order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    patients = result.scalars().all()
    patient_ids = [p.id for p in patients]

    if patient_ids:
        # Batch assessment counts — no N+1
        ac_result = await db.execute(
            select(Report.patient_id, func.count(Report.id))
            .where(Report.patient_id.in_(patient_ids))
            .group_by(Report.patient_id)
        )
        assessment_counts = dict(ac_result.all())

        # Latest risk level per patient via subquery
        subq = (
            select(Report.patient_id, func.max(Report.created_at).label("max_date"))
            .where(Report.patient_id.in_(patient_ids))
            .group_by(Report.patient_id)
            .subquery()
        )
        lr_result = await db.execute(
            select(Report.patient_id, Report.risk_level)
            .join(subq, and_(
                Report.patient_id == subq.c.patient_id,
                Report.created_at == subq.c.max_date,
            ))
        )
        latest_risk = dict(lr_result.all())
    else:
        assessment_counts = {}
        latest_risk       = {}

    return {
        "patients": [
            _shape_patient(p, assessment_counts.get(p.id, 0), latest_risk.get(p.id))
            for p in patients
        ],
        "total": total,
        "page":  page,
        "pages": max(1, -(-total // limit)),
    }


# POST /admin/doctors 

@router.post("/doctors", status_code=201)
async def register_doctor(
    body: RegisterDoctorRequest,
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(require_admin),
):
    """Admin-only: create a new doctor account."""

    existing = (await db.execute(
        select(User).where(User.email == body.email)
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    doctor = User(
        name=            body.name,
        email=           body.email,
        hashed_password= hash_password(body.password),
        role=            "doctor",
        speciality=      body.speciality,
        license_number=  body.license_number,
        phone=           body.phone,
        dob=             body.dob,
        gender=          body.gender
    )
    db.add(doctor)
    await db.commit()
    await db.refresh(doctor)

    return {
        "id":             doctor.id,
        "name":           doctor.name,
        "email":          doctor.email,
        "speciality":     getattr(doctor, "speciality", None),
        "license_number": getattr(doctor, "license_number", None),
        "phone":            getattr(doctor, "phone", None),
        "dob":              getattr(doctor, "dob", None),
        "gender":           getattr(doctor, "gender", None),
        "message":        "Doctor registered successfully",
    }


# DELETE /admin/doctors/{doctor_id} 
@router.delete("/doctors/{doctor_id}")
async def deactivate_doctor(
    doctor_id: str,
    db:        AsyncSession = Depends(get_db),
    user:      User         = Depends(require_admin),
):
    """Soft-deactivate a doctor account (sets is_active = False)."""
    doctor = (await db.execute(
        select(User).where(User.id == doctor_id, User.role == "doctor")
    )).scalar_one_or_none()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not getattr(doctor, "is_active", True):
        raise HTTPException(status_code=400, detail="Doctor is already deactivated")

    doctor.is_active = False
    await db.commit()
    return {"message": f"Doctor {doctor.name} deactivated successfully"}


# POST /admin/doctors/{doctor_id}/activate
@router.post("/doctors/{doctor_id}/activate")
async def activate_doctor(
    doctor_id: str,
    db:        AsyncSession = Depends(get_db),
    user:      User         = Depends(require_admin),
):
    """Reactivate a doctor account (sets is_active = True)."""
    doctor = (await db.execute(
        select(User).where(User.id == doctor_id, User.role == "doctor")
    )).scalar_one_or_none()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if getattr(doctor, "is_active", True):
        raise HTTPException(status_code=400, detail="Doctor is already active")

    doctor.is_active = True
    await db.commit()
    return {"message": f"Doctor {doctor.name} activated successfully"}




