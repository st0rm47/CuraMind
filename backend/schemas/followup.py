# This file contains the schemas for follow-up-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from multiprocessing.util import info
from typing import Optional
from pydantic import BaseModel, Field, ValidationInfo, model_validator

class FollowUpRequest(BaseModel):
    glucose: Optional[float] = Field(None, ge=0.0, le=500.0, description="Updated blood glucose level in mg/dL")                 # Blood glucose level in mg/dL (0-500 mg/dL)
    systolic_bp: Optional[float] = Field(None, ge=0.0, le=300.0, description="Updated systolic blood pressure in mmHg")          # Systolic blood pressure in mmHg (0-300 mmHg)
    diastolic_bp: Optional[float] = Field(None, ge=0.0, le=200.0, description="Updated diastolic blood pressure in mmHg")        # Diastolic blood pressure in mmHg (0-200 mmHg)
    weight: Optional[float] = Field(None, ge=20.0, le=300.0, description="Updated weight in kilograms")                          # Weight in kilograms (20-300 kg)
    feeling: str = Field(..., pattern="^(better|worse|same)$")                                                        # Patient's self-reported feeling compared to the last assessment (better, worse, same)
    symptoms: Optional[str] = Field(None, description="Updated Symptoms")                             # Updated symptoms reported by the patient (optional, can be added later)
    