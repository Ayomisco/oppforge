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
from .vector_db import VectorDBService
from ..scrapers.heavy.devpost import DevpostScraper
from ..scrapers.heavy.devfolio import DevfolioScraper
from ..scrapers.heavy.twitter_playwright import TwitterPlaywrightScraper
from ..utils.text_processing import normalize_url, generate_content_hash, extract_deadline, extract_reward_pool, extract_skills, is_opportunity_fresh

class IngestionPipeline:
    def __init__(self):
        self.scrapers = [
            RedditScraper(),
            GitcoinScraper()
        ]
        
        # Async Scrapers (Heavy)
        # Playwright Scrapers (Async)
        self.async_scrapers = [
            DevpostScraper(),
            DevfolioScraper(),
            TwitterPlaywrightScraper()
        ]
        self.db = SessionLocal()

    def run(self):
        print("[Ingestion] Starting pipeline (AI Augmented)...")
        total_new = 0
        new_opps_list = [] # Store for notification processing
        
        # 1. Run Synchronous Scrapers
        for scraper in self.scrapers:
            try:
                opportunities = scraper.run()
                added_opps = self._save_opportunities(opportunities)
                new_opps_list.extend(added_opps)
                total_new += len(added_opps)
            except Exception as e:
                print(f"[Ingestion] Error running {scraper.source_name}: {e}")
                self.db.rollback()

        # 2. Run Asynchronous Scrapers
        if self.async_scrapers:
            print("[Ingestion] Running async scrapers (Playwright)...")
            # Ensure clean state before async
            self.db.close()
            self.db = SessionLocal()
            asyncio.run(self._run_async_scrapers(new_opps_list))
            total_new += len(new_opps_list) # Note: List extended in place? No, need to return.

        # Process Notifications async
        if new_opps_list:
            print(f"[Ingestion] Processing notifications for {len(new_opps_list)} new items...")
            asyncio.run(self._process_notifications(new_opps_list))

        self.db.close()
        print(f"[Ingestion] Pipeline complete. Opportunities processed.")

    async def _run_async_scrapers(self, new_opps_list):
        for scraper in self.async_scrapers:
            try:
                print(f"[Ingestion] Running async scraper: {scraper.__class__.__name__}")
                opportunities = await scraper.run_async()
                print(f"[Ingestion] Scraper returned {len(opportunities)} items.")
                
                added_opps = self._save_opportunities(opportunities)
                print(f"[Ingestion] Saved {len(added_opps)} new items from async scraper.")
                
                new_opps_list.extend(added_opps)
            except Exception as e:
                print(f"[Ingestion] Error running async scraper: {e}")
                self.db.rollback()

    def _save_opportunities(self, opportunities):
        added = []
        for opp_data in opportunities:
            # --- 0. Pre-processing & Deduplication ---
            
            # Normalize URL
            raw_url = opp_data.get("url", "")
            clean_url = normalize_url(raw_url)
            opp_data["url"] = clean_url
            
            # Generate Hash (Title + Description + Source)
            content_sig = f"{opp_data.get('title','')}{opp_data.get('description','')}{opp_data.get('source','')}"
            content_hash = generate_content_hash(content_sig)
            
            # Check 1: ID constraint (Legacy check)
            exists_id = self.db.query(Opportunity).filter(
                Opportunity.source_id == str(opp_data["source_id"]),
                Opportunity.source == opp_data["source"]
            ).first()
            if exists_id:
                print(f"  - Exists (ID={exists_id.id}), skipping.")
                continue

            # Check 2: URL check (if URL exists)
            if clean_url:
                exists_url = self.db.query(Opportunity).filter(Opportunity.url == clean_url).first()
                if exists_url:
                    print(f"  - Exists (URL Match), skipping.")
                    continue
            
            # Note: We probably want to add a `content_hash` column to DB later for faster lookup.
            # For now, relying on Title match in step 2 is "good enough" for content dupes if titles are identical.

            # --- 1. AI Triage & Refinement ---
            # Freshness Check: Skip if deadline or created date is old (Pre-2026)
            # Use raw data if refined not yet available
            text_for_date = opp_data.get("description", "") + " " + opp_data.get("title", "")
            found_deadline = extract_deadline(text_for_date)
            
            # If we explicitly find an old date, discard immediately
            if found_deadline and not is_opportunity_fresh(found_deadline):
                 print(f"  - Stale (Date: {found_deadline}), skipping.")
                 continue

            print(f"  ? Triaging: {opp_data['title'][:40]}...")
            refined_data = AgentCurator.triage_and_refine(opp_data)
            
            if not refined_data:
                print(f"  - Noise discarded.")
                continue

            # --- 2. Post-Refinement Deduplication ---
            title_exists = self.db.query(Opportunity).filter(
                Opportunity.title == refined_data["title"]
            ).first()
            if title_exists: 
                print(f"  - Exists (Title Match), skipping.")
                continue

            # --- 3. Trust Protocol (Anti-Deception) ---
            from ..utils.trust_engine import TrustEngine
            trust_score = TrustEngine.calculate_score(refined_data)
            refined_data["trust_score"] = trust_score
            
            if trust_score < 30:
                print(f"  [Trust] HIGH RISK detected (Score: {trust_score}). Auto-flagging.")
                refined_data["is_verified"] = False
            elif trust_score > 85:
                refined_data["is_verified"] = True

            # --- 3. Enhanced Field Extraction ---
            text_blob = (refined_data.get("description", "") or "") + " " + (refined_data.get("title", "") or "")
            
            # Deadline
            current_deadline = refined_data.get("deadline")
            extracted_deadline = extract_deadline(text_blob)
            
            if not current_deadline or "2024-01-01" in str(current_deadline): 
                if extracted_deadline:
                    refined_data["deadline"] = extracted_deadline
                    print(f"    -> Extracted Deadline: {extracted_deadline}")
            
            # Reward Pool
            if not refined_data.get("reward_pool") or refined_data.get("reward_pool") == "See Details":
                extracted_reward = extract_reward_pool(text_blob)
                if extracted_reward:
                    refined_data["reward_pool"] = extracted_reward
                    print(f"    -> Extracted Reward: {extracted_reward}")

            # Skills & Tags
            extracted_skills = extract_skills(text_blob)
            existing_tags = refined_data.get("tags") or []
            # Ensure List
            if isinstance(existing_tags, str): existing_tags = [existing_tags]
            
            refined_data["required_skills"] = extracted_skills
            refined_data["tags"] = list(set(existing_tags + extracted_skills))
            
            if extracted_skills:
                 print(f"    -> Extracted Skills: {extracted_skills}")

            print(f"  + Saving Refined: {refined_data['title'][:40]}...")
            opp = Opportunity(**refined_data)
            try:
                self.db.add(opp)
                self.db.commit() # Commit immediately to get ID
                self.db.refresh(opp)
                added.append(opp)
                
                # Vector Search Integration
                try:
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
                    VectorDBService.add_opportunity(vector_payload)
                except Exception as ve:
                    print(f"  [VectorDB] Creating embedding failed (skipping): {ve}")

            except Exception as e:
                print(f"  - Error saving item: {e}")
                self.db.rollback()
        
        return added

    async def _process_notifications(self, new_opps):
        # Fetch users who want email alerts
        # Use a FRESH session for async notification logic or manual sync loop.
        # But for best practices, let's keep it simple: sync data read, async send.
        
        notify_db = SessionLocal()
        try:
            users = notify_db.query(User).all()
            
            # Since objects from new_opps are from self.db, they might be detached or in another session.
            # We should re-fetch or use IDs. But simpler: just use dictionary or detached data.
            # Convert opps to simple dicts to avoid SQLAlchemy detachment issues in async context.
            opp_dicts = []
            for opp in new_opps:
                opp_dicts.append({
                    "id": opp.id,
                    "title": opp.title,
                    "category": opp.category,
                    "chain": opp.chain,
                    "reward_pool": opp.reward_pool,
                    "description": opp.description,
                    "url": opp.url
                })

            for opp in opp_dicts:
                for user in users:
                    # Check preferences
                    prefs = user.notification_settings or {}
                    if not prefs.get("email_alerts", True): # Default True
                        continue

                    # Match Logic:
                    # 1. Category Match
                    user_cats = [c.lower() for c in (user.preferred_categories or [])]
                    cat_match = not user_cats or (opp["category"] and opp["category"].lower() in user_cats)
                    
                    # 2. Chain Match
                    user_chains = [c.lower() for c in (user.preferred_chains or [])]
                    chain_match = not user_chains or (opp["chain"] and opp["chain"].lower() in user_chains)
                    
                    # 3. Skills Match (Keyword search in description)
                    user_skills = [s.lower() for s in (user.skills or [])]
                    text_blob = (opp["description"] or "") + (opp["title"] or "")
                    skill_match = not user_skills or any(s in text_blob.lower() for s in user_skills)
                    
                    # If matches (any of the valid criteria - usually stricter, but flexible for now)
                    is_relevant = (cat_match and chain_match) or skill_match
                    
                    if is_relevant:
                        # Create Web Notification (Sync DB write)
                        notif = Notification(
                            user_id=user.id,
                            title=f"New Opportunity: {opp['title']}",
                            message=f"A new {opp['category']} on {opp['chain']} matches your profile.",
                            type="opportunity",
                            link=f"/opportunities/{opp['id']}"
                        )
                        notify_db.add(notif)
                        
                        # Send Email (Async)
                        if user.email:
                            body_html = get_email_template(
                                title=f"New Match: {opp['title']}",
                                body=f"We found a new opportunity that matches your preferences.<br><br><strong>Category:</strong> {opp['category']}<br><strong>Chain:</strong> {opp['chain']}<br><strong>Reward:</strong> {opp['reward_pool'] or 'Unspecified'}<br><br>{opp['description'][:200]}...",
                                cta_link=opp["url"],
                                cta_text="View Details"
                            )
                            # Using await here
                            await send_email(user.email, f"New Opportunity found: {opp['title']}", body_html)
            
            notify_db.commit()
        except Exception as e:
            print(f"[Ingestion] Notification Error: {e}")
            notify_db.rollback()
        finally:
            notify_db.close()

from dotenv import load_dotenv

def run_pipeline():
    load_dotenv()
    pipeline = IngestionPipeline()
    pipeline.run()

if __name__ == "__main__":
    run_pipeline()
