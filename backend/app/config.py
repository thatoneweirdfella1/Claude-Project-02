import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent.parent
DB_PATH = BASE_DIR / "translator.db"

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
