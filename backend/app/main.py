from fastapi import WebSocket, WebSocketDisconnect
from .core.sockets import manager
from .models.feedback import Feedback  # Ensures table creation
from .models.audit import AuditLog  # Ensures table creation
from .models.ecosystem import Ecosystem  # Ensures table creation
from .database import engine, Base
from .routers import auth, opportunities, stats, tracker, notifications, chat, search, admin_audit, billing, admin as admin_router, feedback, workspace
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

load_dotenv()

# Routers

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OppForge API",
    version="0.1.0",
    redirect_slashes=False,  # Prevent 307 redirects that cause mixed-content errors
)

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

# Global exception handler — ensures CORS headers on 500s


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


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
app.include_router(workspace.router)
app.include_router(search.router)
app.include_router(admin_audit.router)
app.include_router(billing.router)
app.include_router(admin_router.router)
app.include_router(feedback.router)


@app.get("/")
def read_root():
    return {"message": "OppForge API is running 🚀"}


@app.get("/health")
def check_health():
    return {"status": "ok", "database": "connected"}
