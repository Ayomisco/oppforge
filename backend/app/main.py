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

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://app.oppforge.xyz",
    "https://oppforge.xyz",
    "https://oppforge-platform.vercel.app",
]

# Allow any vercel discovery for testing
allow_all_vercel = os.getenv("ALLOW_VERCEL_CORS", "true").lower() == "true"

# Allow any vercel discovery for testing
allow_all_vercel = os.getenv("ALLOW_VERCEL_CORS", "true").lower() == "true"

from fastapi import Request

@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    origin = request.headers.get("origin")
    response = await call_next(request)
    
    if origin:
        if origin in origins or (allow_all_vercel and origin.endswith(".vercel.app")):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Standard CORSMiddleware as fallback/backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
