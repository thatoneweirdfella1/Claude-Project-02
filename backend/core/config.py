"""Configuration and settings for ADHD-to-AI Translator."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings from environment."""

    # API Keys
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "./app.db")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "./logs/app.log")

    # Learning system
    LEARNING_ANALYSIS_THRESHOLD: int = int(
        os.getenv("LEARNING_ANALYSIS_THRESHOLD", "15")
    )
    MAX_TECHNIQUE_STACK: int = int(os.getenv("MAX_TECHNIQUE_STACK", "6"))

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Models
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "opus_fast")
    ENABLE_EXTENDED_THINKING: bool = (
        os.getenv("ENABLE_EXTENDED_THINKING", "true").lower() == "true"
    )

    # Phase 11 Multi-AI
    ENABLE_MULTI_AI: bool = os.getenv("ENABLE_MULTI_AI", "true").lower() == "true"


settings = Settings()
