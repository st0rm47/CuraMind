# This file contains api routes related to user authentication, such as registration and login.

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.deps import get_current_user
from models.notifications import Notification
from models.user import User
from db.session import get_db
from core.security import hash_password, verify_password, create_access_token
from schemas.auth import RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user: RegisterRequest, 
    db: AsyncSession = Depends(get_db)
):
    
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
        hashed_password=hash_password(user.password),  # Hash the password before storing
        role=user.role,
        dob=user.dob,
        gender=user.gender,
        phone=user.phone,
        speciality=user.speciality,
        license_number=user.license_number
    )

    # Add the new user to the database session and commit the transaction
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # Refresh the instance to get the generated ID

    # Welcome message for patients
    if new_user.role == "patient":
        db.add(Notification(
            user_id=new_user.id,
            type="welcome",
            title="Welcome to CuraMind!",
            message="Thank you for registering with CuraMind. We're here to help you manage your mental health and provide support whenever you need it.",
            action_page = "input"
        ))
        
    await db.commit()  # Commit the welcome notification to the database
    token = create_access_token(str(new_user.email))  # Create a JWT access token for the new user
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.model_dump()  # Return the user data in the response (excluding the password)
    }

@router.post("/login")
async def login(
    form:OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    
    # Retrieve the user from the database based on the provided email
    result = await db.execute(
        select(User).where(User.email == form.username)
    )
    db_user = result.scalar_one_or_none()

    # If the user does not exist, raise an HTTP 401 Unauthorized error
    if not db_user:
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )

    # Verify the provided password against the stored hashed password
    if not verify_password(form.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401, 
            detail="Invalid password"
        )

    # Create a JWT access token for the authenticated user
    token = create_access_token(str(db_user.email))

    # If authentication is successful, return a success message 
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user.to_dict()
    }
    
@router.get("/me")
async def me(
    current_user: User = Depends(get_current_user)
):
    return current_user.to_dict()