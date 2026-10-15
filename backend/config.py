import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoAI-Based Road Hazard Prediction and Driver Alert System"
    VERSION: str = "2.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # API Keys (Loaded from .env, never exposed to client)
    TOMTOM_API_KEY: Optional[str] = os.getenv("TOMTOM_API_KEY", "")
    OPENWEATHER_API_KEY: Optional[str] = os.getenv("OPENWEATHER_API_KEY", "")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # Defaults
    DEFAULT_LAT: float = 12.9716
    DEFAULT_LON: float = 77.5946
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
