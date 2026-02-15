from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.opportunity import Opportunity
from ..models.user import User
from ..models.notification import Notification
from ..scrapers.twitter import TwitterScraper
from ..scrapers.reddit import RedditScraper
from ..scrapers.gitcoin import GitcoinScraper
from .email import send_email, get_email_template
import asyncio

from .curator import AgentCurator

class IngestionPipeline:
    def __init__(self):
        self.scrapers = [
            TwitterScraper(),
            RedditScraper(),
            GitcoinScraper()
        ]
        self.db = SessionLocal()

    def run(self):
        print("[Ingestion] Starting pipeline (AI Augmented)...")
        total_new = 0
        new_opps_list = [] # Store for notification processing
        
        for scraper in self.scrapers:
            try:
                opportunities = scraper.run()
                added_opps = self._save_opportunities(opportunities)
                new_opps_list.extend(added_opps)
                total_new += len(added_opps)
            except Exception as e:
                print(f"[Ingestion] Error running {scraper.source_name}: {e}")

        # Process Notifications async
        if new_opps_list:
            print(f"[Ingestion] Processing notifications for {len(new_opps_list)} new items...")
            asyncio.run(self._process_notifications(new_opps_list))

        self.db.close()
        print(f"[Ingestion] Pipeline complete. {total_new} new opportunities saved.")

    def _save_opportunities(self, opportunities):
        added = []
        for opp_data in opportunities:
            # 0. Check if it exists FIRST to avoid redundant AI calls
            exists = self.db.query(Opportunity).filter(
                Opportunity.source_id == str(opp_data["source_id"]),
                Opportunity.source == opp_data["source"]
            ).first()
            if exists: continue

            # 1. AI Triage & Refinement
            print(f"  ? Triaging: {opp_data['title'][:40]}...")
            refined_data = AgentCurator.triage_and_refine(opp_data)
            
            if not refined_data:
                print(f"  - Noise discarded.")
                continue

            # 2. Final duplication check on refined title
            title_exists = self.db.query(Opportunity).filter(
                Opportunity.title == refined_data["title"]
            ).first()
            if title_exists: continue

            print(f"  + Saving Refined: {refined_data['title'][:40]}...")
            opp = Opportunity(**refined_data)
            self.db.add(opp)
            self.db.commit() # Commit immediately to get ID
            self.db.refresh(opp)
            added.append(opp)
        
        return added

    async def _process_notifications(self, new_opps):
        # Fetch users who want email alerts
        # Note: In production, query optimization is needed. For now, fetch all users and filter in python.
        users = self.db.query(User).all()
        
        for opp in new_opps:
            for user in users:
                # Check preferences
                prefs = user.notification_settings or {}
                if not prefs.get("email_alerts", True): # Default True
                    continue

                # Match Logic:
                # 1. Category Match
                user_cats = [c.lower() for c in (user.preferred_categories or [])]
                cat_match = not user_cats or (opp.category and opp.category.lower() in user_cats)
                
                # 2. Chain Match
                user_chains = [c.lower() for c in (user.preferred_chains or [])]
                chain_match = not user_chains or (opp.chain and opp.chain.lower() in user_chains)
                
                # 3. Skills Match (Keyword search in description)
                user_skills = [s.lower() for s in (user.skills or [])]
                text_blob = (opp.description or "") + (opp.title or "")
                skill_match = not user_skills or any(s in text_blob.lower() for s in user_skills)
                
                # If matches (any of the valid criteria - usually stricter, but flexible for now)
                # Let's say: Category AND Chain match OR Skill match
                is_relevant = (cat_match and chain_match) or skill_match
                
                if is_relevant:
                    # Create Web Notification
                    notif = Notification(
                        user_id=user.id,
                        title=f"New Opportunity: {opp.title}",
                        message=f"A new {opp.category} on {opp.chain} matches your profile.",
                        type="opportunity",
                        link=f"/opportunities/{opp.id}"
                    )
                    self.db.add(notif)
                    
                    # Send Email
                    if user.email:
                        body_html = get_email_template(
                            title=f"New Match: {opp.title}",
                            body=f"We found a new opportunity that matches your preferences.<br><br><strong>Category:</strong> {opp.category}<br><strong>Chain:</strong> {opp.chain}<br><strong>Reward:</strong> {opp.reward_pool or 'Unspecified'}<br><br>{opp.description[:200]}...",
                            cta_link=opp.url, # Or platform link
                            cta_text="View Details"
                        )
                        await send_email(user.email, f"New Opportunity found: {opp.title}", body_html)
        
        self.db.commit()

from dotenv import load_dotenv

def run_pipeline():
    load_dotenv()
    pipeline = IngestionPipeline()
    pipeline.run()

if __name__ == "__main__":
    run_pipeline()
