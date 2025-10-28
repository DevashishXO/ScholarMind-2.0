from pydantic_settings import BaseSettings
from pydantic import AnyUrl

class Settings(BaseSettings):
    # MongoDB
    MONGO_URI: str
    MONGO_DB_NAME: str

    # Email (Resend)
    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # JWT
    JWT_SECRET: str
    JWT_EXPIRES_SECONDS: int = 3600
    JWT_ALGORITHM: str = "HS256"

    # OTP
    OTP_TTL_SECONDS: int = 300
    OTP_LENGTH: int = 6
    OTP_MAX_TRIES: int = 5

    # App URLs
    FRONTEND_URL: AnyUrl
    BACKEND_URL: AnyUrl

    # Session / cookies
    SESSION_SECRET: str
    AUTH_COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Create a global settings instance
settings = Settings()
