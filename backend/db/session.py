# This file creates a SQLAlchemy session for database operations.
# It imports the Base class from base.py and sets up the engine and sessionmaker.

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from .base import Base
from core.config import settings

# Create an asynchronous engine using the database URL from settings
engine =  create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Enable SQL query logging for debugging
    pool_pre_ping=True,  # Enable connection pre-ping to check if connections are alive
)

# Create an asynchronous sessionmaker bound to the engine
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,  # Prevent session from expiring objects after commit
    class_=AsyncSession,  # Use AsyncSession for asynchronous operations
)

# Dependency function to get a database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session           # Yield the session for use in API routes
            await session.commit()  # Commit the transaction after use
        except Exception as e:
            await session.rollback()  # Rollback the transaction in case of an error
            raise e                     # Re-raise the exception for further handling
        finally:
            await session.close()  # Ensure the session is closed after use
            


