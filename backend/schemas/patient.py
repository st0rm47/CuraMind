# This file contains the schemas for patient-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from pydantic import BaseModel, Field

class HealthParams(BaseModel):
    input_data :str
    model_used: str
    prediction: str
    risk_level: str
    