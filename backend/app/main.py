from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(title="OppForge API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://oppforge.xyz", "https://app.oppforge.xyz"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client (Lazy init if env vars missing)
supabase: Client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "OppForge API is running 🚀"}

@app.get("/health")
def check_health():
    db_status = "connected" if supabase else "disconnected (missing env)"
    return {"status": "ok", "database": db_status}
