from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from config import APP_NAME, APP_VERSION, APP_DESCRIPTION, CORS_ORIGINS, QR_CODE_DIR
from database import create_tables

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (QR codes)
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Import and include routers
from routers import auth, hives, batches, supply_chain, blockchain, ai, qr, analytics

app.include_router(auth.router)
app.include_router(hives.router)
app.include_router(batches.router)
app.include_router(supply_chain.router)
app.include_router(blockchain.router)
app.include_router(ai.router)
app.include_router(qr.router)
app.include_router(analytics.router)


@app.on_event("startup")
def startup_event():
    create_tables()
    print(f"=== {APP_NAME} v{APP_VERSION} is running! ===")
    print(f"API Docs: http://localhost:8000/docs")


@app.get("/", tags=["Health"])
def root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "description": APP_DESCRIPTION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "app": APP_NAME}
