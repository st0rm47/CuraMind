# This file contains the Notification model for the database
# The Notification model represents a notification sent to a user (e.g., patient or doctor) regarding an assessment or follow-up.

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship, relationship

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the Notification model, which represents a notification sent to a user regarding an assessment or follow-up

class Notification(Base):
    __tablename__ = "notifications" # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the notification
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)  # ID of the user receiving the notification
    
    type: Mapped[str] = mapped_column(SAEnum(
        'assessment',
        'followup',
        'doctor_review',
        'followup_submitted',
        'new_report',
        'welcome',
        name='notification_type'
    ), nullable=False)  # Type of notification (e.g., assessment, follow-up)
    title : Mapped[str] = mapped_column(String(255), nullable=False)  # Title of the notification
    message: Mapped[str] = mapped_column(String(255), nullable=False)  # Message content of the notification
    action_page: Mapped[str] = mapped_column(String(255), nullable=True)  # Optional page or URL that the notification should link to when clicked
    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=True)  # Optional ID of the report associated with the notification, if applicable
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))  # Timestamp when the notification was created
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)  # Flag to indicate if the notification has been read by the user
    
    # Relationships to other models (e.g., user, reports) can be defined here using SQLAlchemy relationships
    user = relationship("User", back_populates="notifications")
    report = relationship("Report", back_populates="notifications")
    
    # Method to convert the Notification object to a dictionary for easy serialization (e.g., for API responses)
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "action_page": self.action_page,
            "report_id": self.report_id,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "is_read": self.is_read,
        }