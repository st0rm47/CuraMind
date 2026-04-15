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
# from schemas.doctor import DoctorReviewCreate

router = APIRouter(prefix="/doctor", tags=["Doctor"])
