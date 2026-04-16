# This file contains the schemas for doctor-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from pydantic import BaseModel, Field
from typing import Optional, List

class DoctorReviewRequest(BaseModel):
    notes: Optional[str] = None
    status :str
    
class DoctorReviewResponse(BaseModel):
    assessment_id : str
    doctor_id : str
    notes: Optional[str] = None
    status :str
    message : str

class AssessmentItem(BaseModel):
    id: str
    patient_id: str
    prediction: str
    risk_level: str
    created_at: str


class DoctorQueueResponse(BaseModel):
    count: int
    items: List[AssessmentItem]