# This file contains security-related utilities for the FastAPI application
# such as password hashing and verification.

from passlib.context import CryptContext

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

