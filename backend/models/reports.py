# This file contains the Assessment model for the database
# The Assessment model represents a medical assessment done by ML models for a patient.

from typing import Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy import JSON, DateTime, Float, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

class Report(Base):
    __tablename__ = "reports"  # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the assessment
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)  # ID of the patient for whom the assessment was done
    
    # Health Parameters
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str] = mapped_column(String(10))          # 1 for male, 0 for female
    weight: Mapped[float] = mapped_column(Float)          # in kg
    height: Mapped[float] = mapped_column(Float)          # in cm
    bmi : Mapped[float] = mapped_column(Float)             # Body Mass Index
    
    glucose: Mapped[float] = mapped_column(Float)         # Blood glucose level in mg/dL
    cholesterol: Mapped[float] = mapped_column(Float)      # Cholesterol level in mg/dL
    
    # Additional parameters for diabetes prediction model
    hemoglobin: Mapped[float] = mapped_column(Float)     # Hemoglobin level in g/dL
    wbc_count: Mapped[float] = mapped_column(Float)      # White blood cell count in 10^9/L
    creatinine: Mapped[float] = mapped_column(Float)     # Creatinine level in mg/dL
    platelet_count: Mapped[float] = mapped_column(Float)  # Platelet count in 10^9/L
    
    
    # Additional parameters for heart disease prediction model
    chest_pain_type: Mapped[str] = mapped_column(String(20))    #
    resting_ecg: Mapped[str] = mapped_column(String(20))    # Resting electrocardiographic results
    resting_bp: Mapped[float] = mapped_column(Float)    # Resting blood pressure in mmHg
    st_slope: Mapped[str] = mapped_column(String(20))    # Slope of the peak exercise ST segment
    exercise_angina: Mapped[str] = mapped_column(String(3))    # Exercise-induced angina (Y/N)
    fasting_bs: Mapped[int] = mapped_column(Integer)    # Fasting blood sugar level in mg/dL
    max_hr: Mapped[float] = mapped_column(Float)    # Maximum heart rate achieved during exercise
    oldpeak: Mapped[float] = mapped_column(Float)    # ST depression induced by exercise relative to rest
    
    # Lifestyle and family history parameters
    smoking_status: Mapped[str] = mapped_column(String(20))          # Smoking status of the patient (never, former, current)
    alcohol_consumption: Mapped[str] = mapped_column(String(20))     # Alcohol consumption of the patient (none, occasional, moderate, high)
    physical_activity: Mapped[str] = mapped_column(String(20))       # Physical activity level of the patient (none, light, moderate, high)
    family_history: Mapped[str] = mapped_column(String(20))         # Family history of the patient (none, diabetes, heart_disease, both)
    symptoms: Mapped[str] = mapped_column(String(255))              # Symptoms reported by the patient (optional, can be added later)
    
    # Predicted Risk Scores
    risk_level: Mapped[str] = mapped_column(String(20))  # Overall risk level (e.g., low, moderate, high) based on the predictions
    predictions: Mapped[dict] = mapped_column(JSON, default=dict)  # JSON field to store predicted risk scores for various conditions (e.g., diabetes, heart disease)
    shap_values: Mapped[list] = mapped_column(JSON, default=list)   # JSON field to store SHAP values for explainability of the predictions
    ensemble_confidence: Mapped[Optional[float]] = mapped_column(Float)  # Confidence score for the ensemble prediction (0-1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))  # Timestamp for when the assessment was created
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # Timestamp for when the assessment was last updated
    
    # Generated Recommendations based on the risk level (can be generated after the prediction is made)
    recommendations: Mapped[dict] = mapped_column(JSON, default=dict)  # JSON field to store lifestyle recommendations based on the predicted risk level
    models_used: Mapped[list] = mapped_column(JSON, default=list)  # JSON field to store the list of ML models used for the prediction (e.g., ["heart_disease_model", "diabetes_model"])
    # Status of the report (pending, reviewed, follow-up)
    status = mapped_column(SAEnum("pending", "reviewed", "follow-up", name="report_status"), default="pending")  # Status of the report (pending, reviewed, follow-up)
    
    # Relationships to other models (e.g., doctor review, follow-ups) can be defined here using SQLAlchemy relationships
    patient = relationship("User", back_populates="reports")  # Relationship to the patient (user) for whom the assessment was done
    doctor_review  = relationship("DoctorReview", back_populates="report", uselist=False)  # Relationship to the doctor review associated with this assessment (if any)
    follow_ups = relationship("FollowUp", back_populates="report")  # Relationship to follow-ups associated with this assessment (if any) 
    notifications = relationship("Notification", back_populates="report")
                
    # Method to convert the Report object to a dictionary for easy serialization (e.g., for API responses)
    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.name if self.patient else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "params": {
                "age": self.age,
                "gender": self.gender,
                "weight": self.weight,
                "height": self.height,
                "bmi": self.bmi,
                "glucose": self.glucose,
                "cholesterol": self.cholesterol,
                "hemoglobin": self.hemoglobin,
                "wbc_count": self.wbc_count,
                "creatinine": self.creatinine,
                "platelet_count": self.platelet_count,
                "chest_pain_type": self.chest_pain_type,
                "resting_ecg": self.resting_ecg,
                "resting_bp": self.resting_bp,
                "st_slope": self.st_slope,
                "exercise_angina": self.exercise_angina,
                "fasting_bs": self.fasting_bs,
                "max_hr": self.max_hr,
                "oldpeak": self.oldpeak,
                "smoking_status": self.smoking_status,
                "alcohol_consumption": self.alcohol_consumption,
                "physical_activity": self.physical_activity,
                "family_history": self.family_history,
                "symptoms": self.symptoms,
            },
            "results": {
                "predictions": self.predictions,
                "risk_level": self.risk_level,
                "shap_values": self.shap_values,
                "ensemble_confidence": self.ensemble_confidence,
                "recommendations": self.recommendations,
                "models_used": self.models_used,
                
            },
            "doctor_review": self.doctor_review.to_dict() if self.doctor_review else None,  # Include doctor review if it exists
            "follow_ups": [followup.to_dict() for followup in self.follow_ups]  # Include follow-ups if they exist
        }
        