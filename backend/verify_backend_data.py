import sys
import os
import asyncio

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy import text
from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.services.vector_db import VectorDBService
from sqlalchemy.orm import Session

def run_verification():
    print("=== OppForge Backend Verification ===")
    
    # 1. Database Connection
    db = SessionLocal()
    try:
        db_res = db.execute(text("SELECT 1")).scalar()
        print(f"[DB] Connection: {'OK' if db_res else 'FAIL'}")
        
        # 2. Data Health
        count = db.query(Opportunity).count()
        devpost_count = db.query(Opportunity).filter(Opportunity.source == "Devpost").count()
        reddit_count = db.query(Opportunity).filter(Opportunity.source == "Reddit").count()
        print(f"[Data] Total Opportunities: {count}")
        print(f"[Data] Devpost: {devpost_count}")
        print(f"[Data] Reddit: {reddit_count}")
        
        if devpost_count > 0:
            sample = db.query(Opportunity).filter(Opportunity.source == "Devpost").first()
            print(f"[Data] Sample Devpost: {sample.title} (ID: {sample.source_id})")
        else:
            print("[Data] WARNING: No Devpost data found. Did the scraper run?")

        # 3. Vector Search
        print("\n=== Testing Vector Search ===")
        # Test mocked or real
        try:
            results = VectorDBService.search("hackathon", n_results=3)
            # Check structure
            if results and 'ids' in results:
                print(f"[Vector] Search 'hackathon' returned {len(results['ids'][0])} results.")
            elif results is None:
                 print("[Vector] Search service returned None (likely disabled due to missing deps).")
            else:
                 print(f"[Vector] Unexpected result format: {results}")
                 
        except Exception as e:
            print(f"[Vector] Search Error: {e}")

    except Exception as e:
        print(f"[DB] Critical Error: {e}")
    finally:
        db.close()
        print("\n=== Verification Complete ===")

if __name__ == "__main__":
    run_verification()
