from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Routers
from .routers import auth, opportunities, stats, tracker, notifications, chat, search, admin_audit, billing
from .database import engine, Base
from .models.ecosystem import Ecosystem # Ensures table creation
from .models.audit import AuditLog # Ensures table creation

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OppForge API", version="0.1.0")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://app.oppforge.xyz",
    "https://app.oppforge.xyz/",
    "https://oppforge.xyz",
    "https://oppforge-platform.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .core.sockets import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep connection open, we broadcast from elsewhere
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(stats.router)
app.include_router(tracker.router)
app.include_router(notifications.router)
app.include_router(chat.router)
app.include_router(search.router)
app.include_router(admin_audit.router)
app.include_router(billing.router)

@app.get("/")
def read_root():
    return {"message": "OppForge API is running 🚀"}

@app.get("/health")
def check_health():
    return {"status": "ok", "database": "connected"}

@app.get("/debug/db")
def debug_database():
    """Temporary debug endpoint - remove after fixing"""
    from sqlalchemy.orm import Session
    from .database import SessionLocal, SQLALCHEMY_DATABASE_URL
    from .models.opportunity import Opportunity
    db = SessionLocal()
    try:
        count = db.query(Opportunity).count()
        open_count = db.query(Opportunity).filter(Opportunity.is_open == True).count()
        db_type = "postgres" if "postgres" in SQLALCHEMY_DATABASE_URL else "sqlite"
        return {
            "db_type": db_type,
            "total_opportunities": count,
            "open_opportunities": open_count,
            "db_url_prefix": SQLALCHEMY_DATABASE_URL[:30] + "..." if len(SQLALCHEMY_DATABASE_URL) > 30 else SQLALCHEMY_DATABASE_URL
        }
    finally:
        db.close()
