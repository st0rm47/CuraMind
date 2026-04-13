# This file contains the Notification model for the database
# The Notification model represents a notification sent to a user (e.g., patient or doctor) regarding an assessment or follow-up.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the Notification model, which represents a notification sent to a user regarding an assessment or follow-up

class Notification(Base):
    __tablename__ = "notifications" # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the notification
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"), nullable=False)  # ID of the user receiving the notification
    
    title : Mapped[str] = mapped_column(String(255), nullable=False)  # Title of the notification
    message: Mapped[str] = mapped_column(String(255), nullable=False)  # Message content of the notification
    type: Mapped[str] = mapped_column(SAEnum("assessment", "followup", name="notification_type"), nullable=False)  # Type of notification (e.g., assessment, follow-up)
    
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))  # Timestamp when the notification was created