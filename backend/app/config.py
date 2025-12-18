from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL", "https://tirhydbapmyzsdgsidmw.supabase.co")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    secret_key: str = os.getenv("SECRET_KEY", "your-very-secret-key-change-this-in-production-min-32-characters-long-12345678")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings():
    return Settings()


