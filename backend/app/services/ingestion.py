from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.opportunity import Opportunity
from ..models.user import User
from ..models.notification import Notification
from ..scrapers.twitter import TwitterScraper
from ..scrapers.reddit import RedditScraper
from ..scrapers.gitcoin import GitcoinScraper
from ..scrapers.dorahacks import DoraHacksScraper
from ..scrapers.immunefi import ImmunefiScraper
from ..scrapers.code4rena import Code4renaScraper
from ..scrapers.ethglobal import ETHGlobalScraper
from .email import send_email, get_email_template
import asyncio
import logging

from .curator import AgentCurator
from .vector_db import VectorDBService
from .ai import check_duplicate_semantic, get_risk_assessment
from ..scrapers.heavy.devpost import DevpostScraper
from ..scrapers.heavy.twitter_playwright import TwitterPlaywrightScraper
from ..utils.text_processing import normalize_url, generate_content_hash, extract_deadline, extract_reward_pool, extract_skills, is_opportunity_fresh, extract_chain

logger = logging.getLogger(__name__)

class IngestionPipeline:
    def __init__(self):
        # Synchronous Scrapers
        self.scrapers = [
            RedditScraper(),
            GitcoinScraper(),
            DoraHacksScraper(),
            ImmunefiScraper(),
            Code4renaScraper(),
            ETHGlobalScraper()
        ]
        
        # Async Scrapers (Heavy/Playwright)
        self.async_scrapers = [
            DevpostScraper(),
            TwitterPlaywrightScraper()
        ]
        self.db = SessionLocal()

    def run(self):
        logger.info("🚀 [Ingestion] Starting Strategic Intelligence Pipeline...")
        total_new = 0
        new_opps_list = []
        
        # 1. Run Synchronous Scrapers
        for scraper in self.scrapers:
            try:
                logger.info(f"🔍 [Pipeline] Running {scraper.source_name}...")
                raw_data = scraper.fetch()
                opportunities = scraper.parse(raw_data)
                added_opps = self._save_opportunities(opportunities)
                new_opps_list.extend(added_opps)
                total_new += len(added_opps)
            except Exception as e:
                logger.error(f"❌ [Pipeline] Error running {scraper.source_name}: {e}")
                self.db.rollback()

        # 2. Run Asynchronous Scrapers
        if self.async_scrapers:
            logger.info("⚡ [Pipeline] Running async heavy scrapers (Playwright)...")
            self.db.close()
            self.db = SessionLocal()
            asyncio.run(self._run_async_scrapers(new_opps_list))
            total_new += len(new_opps_list)

        # 3. Process Notifications
        if new_opps_list:
            logger.info(f"🔔 [Pipeline] Processing notifications for {len(new_opps_list)} new missions...")
            asyncio.run(self._process_notifications(new_opps_list))

        self.db.close()
        logger.info(f"🏁 [Pipeline] Intelligence gathering complete. New opportunities forged: {total_new}")

    async def _run_async_scrapers(self, new_opps_list):
        for scraper in self.async_scrapers:
            try:
                logger.info(f"🤖 [Async] Initializing {scraper.__class__.__name__}...")
                opportunities = await scraper.run_async()
                added_opps = self._save_opportunities(opportunities)
                new_opps_list.extend(added_opps)
            except Exception as e:
                logger.error(f"❌ [Async] Error: {e}")
                self.db.rollback()

    def _save_opportunities(self, opportunities):
        added = []
        for opp_data in opportunities:
            try:
                # --- Layer 1: URL-based & ID Calibration ---
                clean_url = normalize_url(opp_data.get("url", ""))
                opp_data["url"] = clean_url
                
                # Check for direct conflicts (ID or URL)
                exists = self.db.query(Opportunity).filter(
                    (Opportunity.source_id == str(opp_data.get("source_id"))) | 
                    (Opportunity.url == clean_url)
                ).first()
                
                if exists:
                    # Layer 3: Semantic Clustering (Merging)
                    # If it exists, we "enrich" if there's new data, but don't duplicate
                    if not exists.reward_pool and opp_data.get("reward_pool"):
                        exists.reward_pool = opp_data["reward_pool"]
                        self.db.commit()
                    continue

                # --- Layer 2: Content-based (Embedding Similarity) ---
                # Check if we have something semantically identical but from a different source
                content_blob = f"{opp_data.get('title')} {opp_data.get('description', '')[:200]}"
                duplicates = check_duplicate_semantic(content_blob)
                if duplicates:
                    # If high similarity (e.g. > 0.9 by observation), skip
                    # Note: We trust the AI engine's distance/similarity logic here
                    logger.info(f"  - Duplicate detected via Semantic Cluster: {opp_data['title']}")
                    continue

                # --- Freshness Verification ---
                if not is_opportunity_fresh(opp_data.get("deadline")):
                    # Re-extract
                    text_blob = f"{opp_data.get('title')} {opp_data.get('description', '')}"
                    deadline = extract_deadline(text_blob)
                    if deadline and is_opportunity_fresh(deadline):
                        opp_data["deadline"] = deadline
                    else:
                        continue # Skip truly stale items

                # --- Intelligence Extraction ---
                text_blob = f"{opp_data.get('title')} {opp_data.get('description', '')}"
                
                # 1. Chain Tagging
                if not opp_data.get("chain") or opp_data["chain"] == "Unknown":
                    opp_data["chain"] = extract_chain(text_blob)
                
                # 2. Prize Normalization
                if not opp_data.get("reward_pool") or "TBD" in str(opp_data["reward_pool"]):
                    opp_data["reward_pool"] = extract_reward_pool(text_blob)
                
                # 3. AI Triage
                refined_data = AgentCurator.triage_and_refine(opp_data)
                if not refined_data: continue

                # 4. 🧠 AI Risk Assessment
                logger.info(f"  🛡️ Assessing risk: {refined_data['title'][:30]}...")
                risk_data = get_risk_assessment(refined_data)
                refined_data["risk_score"] = risk_data.get("risk_score")
                refined_data["risk_level"] = risk_data.get("risk_level")
                refined_data["risk_flags"] = risk_data.get("flags", [])
                
                # Score adjustment: 100 - risk_score (if risk_score is high-risk in AI engine terms)
                # Note: our AI engine returns 100 for safe, so we map it directly
                refined_data["trust_score"] = risk_data.get("risk_score", 70)

                # --- Persistence ---
                opp = Opportunity(**refined_data)
                self.db.add(opp)
                self.db.commit()
                self.db.refresh(opp)
                added.append(opp)
                
                # Vector DB Sync
                VectorDBService.add_opportunity(opp.to_dict())
                logger.info(f"  + Forge Complete: {opp.title[:40]}")

            except Exception as e:
                logger.error(f"  - Ingestion Error for {opp_data.get('title', 'Unknown')}: {e}")
                self.db.rollback()
        
        return added

    async def _process_notifications(self, new_opps):
        notify_db = SessionLocal()
        try:
            users = notify_db.query(User).all()
            for opp in new_opps:
                for user in users:
                    # Simple relevance heuristic
                    relevant = False
                    if opp.chain.lower() in [c.lower() for c in (user.preferred_chains or [])]:
                        relevant = True
                    if any(s.lower() in opp.description.lower() for s in (user.skills or [])):
                        relevant = True
                    
                    if relevant and user.email:
                        body_html = get_email_template(
                            title=f"New Mission: {opp.title}",
                            body=f"Risk Score: {opp.risk_score}/100 | {opp.description[:200]}...",
                            cta_link=opp.url,
                            cta_text="View Mission"
                        )
                        await send_email(user.email, f"OppForge Alert: {opp.title}", body_html)
            notify_db.commit()
        except:
            notify_db.rollback()
        finally:
            notify_db.close()

def run_pipeline():
    pipeline = IngestionPipeline()
    pipeline.run()

if __name__ == "__main__":
    run_pipeline()
