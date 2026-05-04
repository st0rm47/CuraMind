# This file contains Pydantic models for authentication-related data structures.
# These models are used for validating and serializing data in API requests and responses.
# These are input validation models for user creation and authentication processes.

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=20, description="Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number")
    role: str = Field(..., pattern="^(patient|doctor|admin)$", description="Role of the user")                               # Role can be "patient" or "doctor"
    dob: Optional[str] = Field(None, description="Date of Birth of the user")                     # Date of Birth (optional, can be added later)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$", description="Gender of the user")               # Gender (optional, can be added later)
    phone: Optional[str] =None                   # Phone number (optional, can be added later)
    speciality: Optional[str] =None            # Specialty (optional, only for doctors)
    license_number: Optional[str] = None        # License number (optional, only for doctors)
    is_active: Optional[bool] = True           # Whether the user account is active (default is True)

    # Custom validation for password complexity
    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        if not any(c.isupper() for c in value):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in value):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in value):
            raise ValueError('Password must contain at least one number')
        return value
    
    # # Custom validation for email
    # @field_validator('email')
    # @classmethod
    # def validate_email(cls, value):
    #     if not value.endswith('@gmail.com'):
    #         raise ValueError('Email must be from the domain @gmail.com')
    #     return value
    
    # Custom validation for dob format
    @field_validator('dob')
    @classmethod
    def validate_dob(cls, value):
        if value is not None:
            try:
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Date of Birth must be in the format YYYY-MM-DD')
        return value
    
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str   
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    