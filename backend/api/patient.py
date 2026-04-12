# This file contains the API endpoints for patient-related operations
# It defines routes for patients to access their data and interact with the system.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
# from sqalchemy.orm import selectinload

from api.deps import get_current_user, require_patient
from db.session import get_db
from services.ml_engine import predict_disease_risk
from models.user import User

# Create a router for patient-related endpoints with a prefix and tags for documentation
router = APIRouter(prefix="/patient", tags=["Patient"])

@router.post("/assess")
async def assess_health(
    data: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_patient)
):
    prediction = predict_disease_risk(data)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        },
        "input": data,
        "prediction": prediction
    }