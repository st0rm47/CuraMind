# This file contains the schemas for follow-up-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from pydantic import BaseModel, Field

class FollowUpCreate(BaseModel):
    assessment_id: str = Field(..., description="ID of the assessment this follow-up is related to")
    message: str = Field(..., description="Message from the doctor regarding the follow-up action")
    
    
