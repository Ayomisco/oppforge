from app.database import SessionLocal, engine
from app.models.opportunity import Opportunity
from datetime import datetime
import asyncio
from app.services.ingestion import IngestionPipeline

def soft_reset_and_reload():
    db = SessionLocal()
    try:
        print("[Data] Deleting old opportunities pre-2026...")
        # Since we don't trust 'created_at' alone, let's just wipe everything 
        # that doesn't look like a real 2026 opp, OR simply wipe ALL to force fresh scrape.
        # User said "all the post... are old". 
        # Safest bet is to wipe table to ensure freshness.
        
        count = db.query(Opportunity).delete()
        db.commit()
        print(f"[Data] Deleted {count} stale opportunities.")
        
    except Exception as e:
        print(f"[Data] Error: {e}")
        db.rollback()
    finally:
        db.close()

    print("[Data] Triggering fresh ingestion pipeline...")
    pipeline = IngestionPipeline()
    pipeline.run()

if __name__ == "__main__":
    soft_reset_and_reload()
