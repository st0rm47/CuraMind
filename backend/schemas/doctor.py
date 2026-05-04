# This file contains the schemas for doctor-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from pydantic import BaseModel, Field, field_validator
from typing import Dict, Optional, List

class DoctorReviewRequest(BaseModel):
    report_id : str                                                                                                         # Unique identifier for the assessment being reviewed
    patient_id : str                                                                                                            # Unique identifier for the patient associated with the assessment                                                        
    diagnosis : str = Field(..., min_length=2, max_length=200, description="Doctor's diagnosis based on the assessment")        # Doctor's diagnosis based on the assessment (minimum 2 characters, maximum 200 characters)
    recommendations : str = Field(..., min_length=2, max_length=500, description="Doctor's recommendations for the patient")    # Doctor's recommendations for the patient (minimum 2 characters, maximum 500 characters)
    risk_override : Optional[Dict[str,str]] = Field(default_factory=dict)                                                                # Optional field to override the risk level determined by the AI model                                           
    follow_up_weeks: Optional[int] = Field(default=4, ge=1, le=52, description="Number of weeks after which the patient should follow up with the doctor")  # Number of weeks after which the patient should follow up with the doctor (default is 4 weeks, must be between 1 and 52 weeks)

    # Custom 
    @field_validator('risk_override')
    @classmethod
    def validate_risk_override(cls, value):
        valid_levels = {"low", "medium", "high", "critical"}
        if value:
            for key, val in value.items():
                if val not in valid_levels:
                    raise ValueError(f'Invalid risk level: {val}. Valid levels are: {valid_levels}')
        return value
    
    
    
    
    
    
    
# class DoctorReviewResponse(BaseModel):
#     assessment_id : str
#     doctor_id : str
#     notes: Optional[str] = None
#     status :str
#     message : str

# class AssessmentItem(BaseModel):
#     id: str
#     patient_id: str
#     prediction: str
#     risk_level: str
#     created_at: str


# class DoctorQueueResponse(BaseModel):
#     count: int
#     items: List[AssessmentItem]