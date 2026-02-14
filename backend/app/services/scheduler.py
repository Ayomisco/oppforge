import schedule
import time
import threading
from .ingestion import run_pipeline

def start_scheduler():
    # Run once on startup (in separate thread to not block)
    # run_pipeline() 
    
    # Schedule every 6 hours
    schedule.every(6).hours.do(run_pipeline)
    
    print("[Scheduler] Started. Scrapers will run every 6 hours.")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def start_scheduler_thread():
    t = threading.Thread(target=start_scheduler, daemon=True)
    t.start()
