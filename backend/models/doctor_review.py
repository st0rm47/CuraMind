# This file contains the doctor review model for the database
# The DoctorReview model represents a review given by a patient to a doctor.

import uuid
from datetime import datetime, timezone
from sqlalchemy import JSON, DateTime, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the DoctorReview model, which represents a review given by a patient to a doctor
class DoctorReview(Base):
    __tablename__ = "doctor_reviews" # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the review
    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=False, index=True)  # ID of the report for which the review is given
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)  # ID of the doctor being reviewed
    
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)  # Diagnosis provided by the doctor
    recommendations: Mapped[str] = mapped_column(String(255), nullable=False)  # Recommendations provided by the doctor
    risk_override: Mapped[dict] = mapped_column(JSON, default=dict)  # JSON field to store any overrides to the predicted risk scores provided by the doctor
    follow_up_weeks: Mapped[int] = mapped_column(Integer, nullable=False, default=4)  # Number of weeks after which the patient should follow up with the doctor

    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))  # Timestamp for when the review was created
    
    # Relationships to other models (e.g., assessment, doctor) can be defined here using SQLAlchemy relationships
    report= relationship("Report", back_populates="doctor_review")
    doctor = relationship("User", back_populates="reviews_given")
        
    # Method to convert the DoctorReview object to a dictionary for easy serialization (e.g., for API responses)
    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.name if self.doctor else None,
            "diagnosis": self.diagnosis,
            "recommendations": self.recommendations,
            "risk_override": self.risk_override,
            "follow_up_weeks": self.follow_up_weeks,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }