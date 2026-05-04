from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterDoctorRequest(BaseModel):
    name:           str
    email:          EmailStr
    password:       str
    speciality:     Optional[str] = None
    license_number: Optional[str] = None
    phone:          Optional[str] = None
    dob:            Optional[str] = None   # ← add
    gender:         Optional[str] = None   # ← add
 
class DoctorResponse(BaseModel):
    id:             str
    name:           str
    email:          str
    speciality:     Optional[str]
    license_number: Optional[str]
    phone:          Optional[str]
    created_at:     Optional[str]
    total_reviews:  int
    is_active:      bool