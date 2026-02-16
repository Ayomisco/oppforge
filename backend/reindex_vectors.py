import asyncio
from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.services.vector_db import VectorDBService

async def index_existing_data():
    print("[VectorDB] Starting full re-index of existing opportunities...")
    db = SessionLocal()
    try:
        opportunities = db.query(Opportunity).all()
        print(f"[VectorDB] Found {len(opportunities)} items in SQL database.")
        
        count = 0
        for opp in opportunities:
            payload = {
                "id": str(opp.id),
                "title": opp.title,
                "description": opp.description,
                "tags": opp.tags,
                "category": opp.category,
                "chain": opp.chain,
                "source": opp.source,
                "reward_pool": opp.reward_pool,
                "deadline": str(opp.deadline) if opp.deadline else ""
            }
            success = VectorDBService.add_opportunity(payload)
            if success:
                count += 1
                if count % 10 == 0:
                    print(f"[VectorDB] Indexed {count}/{len(opportunities)} items...")
            
        print(f"[VectorDB] Re-index complete. Total items in Vector DB: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(index_existing_data())
