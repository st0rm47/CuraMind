# This file contains the Assessment model for the database
# The Assessment model represents a medical assessment done by ML models for a patient.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

class Assessment(Base):
    __tablename__ = "Assessments"  # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the assessment
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"), nullable=False)  # ID of the patient for whom the assessment was done
    
    input_data: Mapped[str] = mapped_column(String(255), nullable=False)  # Input data used for the assessment (e.g., symptoms, medical history)
    model_used: Mapped[str] = mapped_column(String(255), nullable=False)  # Name of the ML model used for the assessment
    
    prediction: Mapped[str] = mapped_column(String(255), nullable=False)  # Prediction made by the ML model (e.g., diagnosis, risk score)
    risk_level: Mapped[str] = mapped_column(SAEnum("low", "medium", "high", name="risk_level"), nullable=False)  # Risk level associated with the prediction
    
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))  # Timestamp when the assessment was created
    