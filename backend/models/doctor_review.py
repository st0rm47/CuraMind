# This file contains the doctor review model for the database
# The DoctorReview model represents a review given by a patient to a doctor.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the DoctorReview model, which represents a review given by a patient to a doctor
class DoctorReview(Base):
    __tablename__ = "doctor_reviews" # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the review
    assessment_id: Mapped[str] = mapped_column(String(36), ForeignKey("Assessments.id"), nullable=False)  # ID of the assessment associated with the review
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"), nullable=False)  # ID of the doctor being reviewed
    
    verdict: Mapped[str] = mapped_column(String(255), nullable=False)  # Verdict given by the patient (e.g., "satisfied", "unsatisfied")
    notes: Mapped[str] = mapped_column(String(255), nullable=True)  # Additional notes provided by the patient
    
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))  # Timestamp when the review was created

    corrected_decision: Mapped[str] = mapped_column(String(255), nullable=True)  # Corrected decision provided by the patient, if any