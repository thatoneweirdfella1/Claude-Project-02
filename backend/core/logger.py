"""Structured logging setup."""

import logging
import os
from core.config import settings

# Create logs directory if it doesn't exist
os.makedirs(os.path.dirname(settings.LOG_FILE), exist_ok=True)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler(),
    ],
)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
