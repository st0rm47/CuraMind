# This file contains api routes related to user authentication, such as registration and login.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.user import User
from db.session import get_db
from core.security import hash_password, verify_password, create_access_token
from schemas.auth import UserCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    
    # Check if the email is already registered
    existing_user = await db.execute(
        select(User).where(User.email == user.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Create a new User instance with the provided data and hashed password
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),  # Hash the password before storing
        role=user.role
    )

    # Add the new user to the database session and commit the transaction
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # Refresh the instance to get the generated ID

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

@router.post("/login")
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    
    # Retrieve the user from the database based on the provided email
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    db_user = result.scalar_one_or_none()

    # If the user does not exist, raise an HTTP 401 Unauthorized error
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify the provided password against the stored hashed password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create a JWT access token for the authenticated user
    token = create_access_token(data={
        "sub": db_user.email, 
        "user_id": db_user.id, 
        "role": db_user.role
        })
    
    
    # If authentication is successful, return a success message 
    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }