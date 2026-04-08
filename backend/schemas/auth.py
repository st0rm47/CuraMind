# This file contains Pydantic models for authentication-related data structures.
# These models are used for validating and serializing data in API requests and responses.
# These are input validation models for user creation and authentication processes.


from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str  # User's full name
    email: EmailStr  # User's email address, validated as an email format
    password: str  # User's plaintext password
    role: str  # User's role (e.g., "user", "admin")
    
    