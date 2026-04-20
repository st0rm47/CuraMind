# This file contains the User model for the database
# It defines the User class, which inherits from the Base class provided by SQLAlchemy.
# The User model represents a user in the system, which can be either a patient or a doctor.

from typing import Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the User model, which represents a user in the database
class User(Base):
    __tablename__ = "users"  # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the user
    name : Mapped[str] = mapped_column(String(255), nullable=False)  # User's name
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)  # User's email address
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)  # User's hashed password
    role: Mapped[str] = mapped_column(SAEnum("patient", "doctor", name="user_role"), nullable=False)  # User's role (patient or doctor)
    
    # Patient Fields
    dob: Mapped[Optional[str]] = mapped_column(String(20))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Doctor Fields
    speciality: Mapped[Optional[str]] = mapped_column(String(255))
    license_number: Mapped[Optional[str]] = mapped_column(String(255))
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))  # Timestamp for when the user was created
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))  # Timestamp for when the user was last updated
    
    # Relationships to other models (e.g., reports, reviews, notifications) can be defined here using SQLAlchemy relationships
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")  # Relationship to the reports created by the user (if patient)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")  # Relationship to the notifications for the user
    reviews_given = relationship("DoctorReview", back_populates="doctor")  # Relationship to the reviews given by the user (if doctor)
    
    # Method to convert the User object to a dictionary for easy serialization (e.g., for API responses)
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "dob": self.dob,
            "gender": self.gender,
            "phone": self.phone,
            "speciality": self.speciality,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }