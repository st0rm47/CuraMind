# This file contains the follow-up model for the database
# The FollowUp model represents a follow-up action taken by a doctor after reviewing an assessment.

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, String, ForeignKey, Text,  Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

class FollowUp(Base):
    __tablename__ = "followups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=False, index=True)

    glucose: Mapped[Optional[float]] = mapped_column(Float)         # Blood glucose level in mg/dL
    systolic_bp: Mapped[Optional[float]] = mapped_column(Float)     # Systolic blood pressure in mmHg
    diastolic_bp: Mapped[Optional[float]] = mapped_column(Float)    # Diastolic blood pressure in mmHg
    weight: Mapped[Optional[float]] = mapped_column(Float)          # in kg 
    feeling: Mapped[str] = mapped_column(String(20))                # Patient's self-reported feeling compared to the last assessment (better, worse, same)
    symptoms: Mapped[Optional[str]] = mapped_column(Text)            # Updated symptoms reported by the patient (optional, can be added later)
    
    submitted_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))  # Timestamp for when the follow-up was created
    
    # Relationships to other models (e.g., reports) can be defined here using SQLAlchemy relationships
    report = relationship("Report", back_populates="follow_ups")
    
    # Method to convert the FollowUp object to a dictionary for easy serialization (e.g., for API responses)
    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "glucose": self.glucose,
            "systolic_bp": self.systolic_bp,
            "diastolic_bp": self.diastolic_bp,
            "weight": self.weight,
            "feeling": self.feeling,
            "symptoms": self.symptoms,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }
    