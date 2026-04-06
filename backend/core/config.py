# This file contains the configuration settings for the FastAPI application

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CuraMind"  # Name of the application
    APP_VERSION: str = "1.0.0"  # Version of the application
    DATABASE_URL: str  # Database connection URL, loaded from environment variable
    
    class Config:
        env_file = ".env"  # Load environment variables from the .env file
        
# Create an instance of the Settings class to access the configuration values
settings = Settings()
