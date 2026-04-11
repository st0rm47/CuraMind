# This file contains the User model for the database
# It defines the User class, which inherits from the Base class provided by SQLAlchemy.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

# Function to generate a new UUID for the user ID
def new_uuid():
    return str(uuid.uuid4())

# Define the User model, which represents a user in the database
class User(Base):
    __tablename__ = "Users"  # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)  # Unique identifier for the user
    name : Mapped[str] = mapped_column(String(255), nullable=False)  # User's name
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)  # User's email address
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)  # User's hashed password
    role: Mapped[str] = mapped_column(SAEnum("patient", "doctor", name="user_role"), nullable=False)  # User's role (patient or doctor)
    dob: Mapped[str] = mapped_column(String(20), nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)