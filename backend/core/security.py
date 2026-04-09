# This file contains security-related utilities for the FastAPI application
# such as password hashing and verification.

from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from core.config import settings
from typing import Optional

# Create a CryptContext for password hashing using the bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # Hashes a plaintext password using the CryptContext.
    password = password[:72]  # Limit password length to 72 characters for bcrypt
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verifies a plaintext password against a hashed password.
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


#JWT token generation function
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # Creates a JWT access token with the provided data and expiration time.
    to_encode = data.copy()
    
    # Set the expiration time for the token. If expires_delta is provided, use it; otherwise, use the default expiration time from settings.
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add the expiration time to the token payload
    to_encode.update({"exp": expire})
    
    # Encode the token using the secret key and algorithm specified in settings
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

