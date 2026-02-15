import sys
import os
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ingestion import run_pipeline

if __name__ == "__main__":
    print("🚀 INITIALIZING_LIVE_SCRAPE_SEQUENCE...")
    run_pipeline()
    print("✅ SCRAPE_COMPLETE_SYSTEM_SYNCED")
