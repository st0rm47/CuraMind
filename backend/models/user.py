# This file contains the User model for the database
# It defines the User class, which inherits from the Base class provided by SQLAlchemy.

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from db.base import Base

class User(Base):
    __tablename__ = "Users"  # Name of the table in the database
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # Unique identifier for the user
    name: Mapped[str] = mapped_column(String(255), nullable=False)  # User's name
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)  # User's email address
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # User's hashed password
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # User's role (e.g., admin, user)