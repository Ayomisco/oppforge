import sys
import os
import asyncio

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.services.vector_db import VectorDBService

def backfill():
    print("[Backfill] Starting embedding generation for existing opportunities...")
    db = SessionLocal()
    try:
        opps = db.query(Opportunity).all()
        print(f"[Backfill] Found {len(opps)} opportunities.")
        
        success_count = 0
        for opp in opps:
            # We use upsert, so running this is safe (idempotent)
            vector_payload = {
                "id": str(opp.id),
                "title": opp.title,
                "description": opp.description,
                "tags": opp.tags,
                "category": opp.category,
                "chain": opp.chain,
                "source": opp.source,
                "reward_pool": opp.reward_pool,
                "deadline": opp.deadline
            }
            
            if VectorDBService.add_opportunity(vector_payload):
                success_count += 1
                
        print(f"[Backfill] Completed. Successfully embedded {success_count}/{len(opps)} items.")
            
    except Exception as e:
        print(f"[Backfill] Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    backfill()
