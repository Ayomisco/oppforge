from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Routers
from .routers import auth, opportunities, stats, tracker, notifications, chat
from .database import engine, Base

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

# Routers
app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(stats.router)
app.include_router(tracker.router)
app.include_router(notifications.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "OppForge API is running 🚀"}

@app.get("/health")
def check_health():
    return {"status": "ok", "database": "connected"}
