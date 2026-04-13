# This file contains the follow-up model for the database
# The FollowUp model represents a follow-up action taken by a doctor after reviewing an assessment.

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, String, ForeignKey, Text,  Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

class FollowUp(Base):
    __tablename__ = "followups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("Users.id"))

    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="pending")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)