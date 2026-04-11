# This file contains Pydantic models for authentication-related data structures.
# These models are used for validating and serializing data in API requests and responses.
# These are input validation models for user creation and authentication processes.

from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # Role can be "patient" or "doctor"
    dob: Optional[str] # Date of Birth (optional, can be added later)
    gender: Optional[str] # Gender (optional, can be added later)
    phone: Optional[str] # Phone number (optional, can be added later)
    
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str   