# This file contains the configuration settings for the FastAPI application

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CuraMind"  # Name of the application
    APP_VERSION: str = "1.0.0"  # Version of the application
    DEBUG: bool = False  # Debug mode flag, set to True for development and False for production
    
    DATABASE_URL: str  # Database connection URL, loaded from environment variable
    SYNC_DATABASE_URL: str  # Synchronous database URL for Alembic migrations, loaded from environment variable
    
    SECRET_KEY: str  # Secret key for security-related operations, loaded from environment variable
    ALGORITHM: str = "HS256"  # Algorithm used for token encoding (e.g., JWT)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120  # Token expiration time in minutes
    
    class Config:
        env_file = ".env"  # Load environment variables from the .env file
        case_sensitive = True  # Environment variable names are case-sensitive
        
# Create an instance of the Settings class to access the configuration values
settings = Settings()
