from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Routers
from .routers import auth, opportunities, stats, tracker, notifications, chat, search
from .database import engine, Base
from .models.ecosystem import Ecosystem # Ensures table creation

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OppForge API", version="0.1.0")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://app.oppforge.xyz",
    "https://oppforge.xyz"
]

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

@app.get("/")
def read_root():
    return {"message": "OppForge API is running 🚀"}

@app.get("/health")
def check_health():
    return {"status": "ok", "database": "connected"}
