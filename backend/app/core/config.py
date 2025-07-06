import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # API Configuration
    app_name: str = "PDF Chat Application"
    app_version: str = "1.0.0"
    debug: bool = False  # Set to False for production

    # Anthropic Configuration - CLAUDE 4 SONNET
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"  # Claude 4 Sonnet - LATEST MODEL
    max_tokens: int = 1500
    temperature: float = 0.7

    # PDF Configuration
    pdf_path: str = "documents/accessibility_guide.pdf"

    # Chat Configuration
    max_conversation_history: int = 10
    max_message_length: int = 2000

    # CORS Configuration - FIXED FOR PRODUCTION
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://*.onrender.com",
        "https://pdf-chat-app-ashy.vercel.app",  # Your exact Vercel URL
        "https://*.vercel.app",  # Allow all Vercel apps
        "*"  # Allow all origins (for development/testing)
    ]

    # Server Configuration
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings."""
    return settings