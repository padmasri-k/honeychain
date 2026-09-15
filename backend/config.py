import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./honeychain.db")

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "honeychain-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Google Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# App
APP_NAME = "HoneyChain"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Blockchain-based Honey Traceability & Smart Beekeeping Management"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# QR Code
QR_CODE_DIR = os.path.join(os.path.dirname(__file__), "static", "qrcodes")
os.makedirs(QR_CODE_DIR, exist_ok=True)
