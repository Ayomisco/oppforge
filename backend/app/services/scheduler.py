import schedule
import time
import threading
from ..database import SessionLocal
from ..models.opportunity import Opportunity
from ..scrapers.twitter import TwitterScraper
# from ..scrapers.gitcoin import GitcoinScraper

def run_scrapers():
    print("Running scrapers...")
    scrapers = [
        TwitterScraper(),
        # GitcoinScraper()
    ]
    
    db = SessionLocal()
    for scraper in scrapers:
        opportunities = scraper.run()
        for opp_data in opportunities:
            # Check for duplicates
            exists = db.query(Opportunity).filter(
                Opportunity.source_id == opp_data["source_id"],
                Opportunity.source == opp_data["source"]
            ).first()
            if not exists:
                print(f"  + Saving: {opp_data['title'][:30]}...")
                opp = Opportunity(**opp_data)
                db.add(opp)
    
    db.commit()
    db.close()
    print("Scrape complete.")

def start_scheduler():
    # Run once on startup
    # run_scrapers() # Commented out to avoid blocking startup in dev
    
    # Schedule every 6 hours
    schedule.every(6).hours.do(run_scrapers)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def start_scheduler_thread():
    t = threading.Thread(target=start_scheduler, daemon=True)
    t.start()
