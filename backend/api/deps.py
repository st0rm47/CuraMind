# This file contains the dependencies for the FastAPI application, 
# such as database sessions and authentication.

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.session import get_db
from models.user import User
from core.security import decode_access_token

# Define the OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependency to get the current user based on the provided token
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    
    # Define a credentials exception to be raised if the token is invalid or the user cannot be found
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        email = decode_access_token(token)
        if email is None:
            raise credentials_exception
        
        email = email.get("sub")
        if email is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception

    # Query the database to get the user based on the email from the token payload
    result = await db.execute(select(User).where(User.email == email))
    current_user = result.scalar_one_or_none()
    
    if current_user is None:
        raise credentials_exception
    return current_user

# Dependency for role based access control (RBAC)
def require_role(required_role: str):
    async def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access required: {}".format(required_role),
            )
        return current_user
    return role_dependency

# Example usage of the require_role dependency for an admin-only route
require_patient = require_role("patient")
require_doctor = require_role("doctor")