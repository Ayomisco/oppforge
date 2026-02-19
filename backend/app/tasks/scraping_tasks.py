"""
Scraping Tasks for Celery
Handles automated opportunity scraping from all sources
"""

from celery import shared_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.database import SessionLocal
from app.models.ecosystem import Ecosystem
from app.models.opportunity import Opportunity
from app.scrapers import gitcoin, twitter, reddit
from app.services.ingestion import ingest_opportunity

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def scrape_tier1_ecosystems(self):
    """
    Scrape all Tier 1 (high priority) ecosystems.
    Runs every 6 hours.
    """
    db = SessionLocal()
    try:
        ecosystems = db.query(Ecosystem).filter(
            Ecosystem.tier == 1,
            Ecosystem.scraper_enabled == True
        ).all()
        
        logger.info(f"🔍 Scraping {len(ecosystems)} Tier 1 ecosystems...")
        total_found = 0
        
        for eco in ecosystems:
            try:
                count = scrape_ecosystem_grants(eco.id)
                total_found += count
                
                # Update last_scraped_at
                eco.last_scraped_at = datetime.utcnow()
                eco.scrape_count += 1
                db.commit()
                
            except Exception as e:
                logger.error(f"Error scraping {eco.name}: {e}")
                continue
        
        logger.info(f"✅ Tier 1 scrape complete: {total_found} opportunities found")
        return {"tier": 1, "ecosystems": len(ecosystems), "opportunities": total_found}
        
    except Exception as e:
        logger.error(f"Tier 1 scrape failed: {e}")
        raise self.retry(exc=e, countdown=300)  # Retry after 5 minutes
    finally:
        db.close()


@shared_task(bind=True, max_retries=3)
def scrape_tier2_ecosystems(self):
    """
    Scrape all Tier 2 (medium priority) ecosystems.
    Runs every 12 hours.
    """
    db = SessionLocal()
    try:
        ecosystems = db.query(Ecosystem).filter(
            Ecosystem.tier == 2,
            Ecosystem.scraper_enabled == True
        ).all()
        
        logger.info(f"🔍 Scraping {len(ecosystems)} Tier 2 ecosystems...")
        total_found = 0
        
        for eco in ecosystems:
            try:
                count = scrape_ecosystem_grants(eco.id)
                total_found += count
                
                eco.last_scraped_at = datetime.utcnow()
                eco.scrape_count += 1
                db.commit()
                
            except Exception as e:
                logger.error(f"Error scraping {eco.name}: {e}")
                continue
        
        logger.info(f"✅ Tier 2 scrape complete: {total_found} opportunities found")
        return {"tier": 2, "ecosystems": len(ecosystems), "opportunities": total_found}
        
    except Exception as e:
        logger.error(f"Tier 2 scrape failed: {e}")
        raise self.retry(exc=e, countdown=600)
    finally:
        db.close()


@shared_task(bind=True, max_retries=3)
def scrape_tier3_ecosystems(self):
    """
    Scrape all Tier 3 (low priority) ecosystems.
    Runs daily.
    """
    db = SessionLocal()
    try:
        ecosystems = db.query(Ecosystem).filter(
            Ecosystem.tier == 3,
            Ecosystem.scraper_enabled == True
        ).all()
        
        logger.info(f"🔍 Scraping {len(ecosystems)} Tier 3 ecosystems...")
        total_found = 0
        
        for eco in ecosystems:
            try:
                count = scrape_ecosystem_grants(eco.id)
                total_found += count
                
                eco.last_scraped_at = datetime.utcnow()
                eco.scrape_count += 1
                db.commit()
                
            except Exception as e:
                logger.error(f"Error scraping {eco.name}: {e}")
                continue
        
        logger.info(f"✅ Tier 3 scrape complete: {total_found} opportunities found")
        return {"tier": 3, "ecosystems": len(ecosystems), "opportunities": total_found}
        
    except Exception as e:
        logger.error(f"Tier 3 scrape failed: {e}")
        raise self.retry(exc=e, countdown=900)
    finally:
        db.close()


@shared_task
def scrape_twitter():
    """
    Scrape Twitter for Web3 opportunities.
    Runs every 3 hours.
    """
    try:
        logger.info("🐦 Scraping Twitter...")
        scraper = twitter.TwitterScraper()
        results = scraper.run()
        
        db = SessionLocal()
        count = 0
        for opp_data in results:
            try:
                ingest_opportunity(db, opp_data)
                count += 1
            except Exception as e:
                logger.error(f"Error ingesting Twitter opportunity: {e}")
        
        db.close()
        logger.info(f"✅ Twitter scrape complete: {count} opportunities")
        return {"source": "twitter", "count": count}
        
    except Exception as e:
        logger.error(f"Twitter scrape failed: {e}")
        return {"source": "twitter", "error": str(e)}


@shared_task
def scrape_grant_platforms():
    """
    Scrape grant platforms (Gitcoin, DoraHacks, Devpost, Questbook, etc.).
    Runs every 4 hours.
    """
    try:
        logger.info("💰 Scraping grant platforms...")
        
        db = SessionLocal()
        count = 0
        
        # Import all platform scrapers
        from app.scrapers.gitcoin import GitcoinScraper
        from app.scrapers.dorahacks import DoraHacksScraper
        from app.scrapers.questbook import QuestbookScraper
        from app.scrapers.hackquest import HackQuestScraper
        from app.scrapers.superteam import SuperteamScraper
        from app.scrapers.immunefi import ImmunefiScraper
        from app.scrapers.ethglobal import ETHGlobalScraper
        from app.scrapers.code4rena import Code4renaScraper
        from app.scrapers.dework import DeworkScraper
        from app.scrapers.sherlock import SherlockScraper
        from app.scrapers.layer3 import Layer3Scraper
        
        scrapers = [
            GitcoinScraper(),
            DoraHacksScraper(),
            QuestbookScraper(),
            HackQuestScraper(),
            SuperteamScraper(),
            ImmunefiScraper(),
            ETHGlobalScraper(),
            Code4renaScraper(),
            DeworkScraper(),
            SherlockScraper(),
            Layer3Scraper()
        ]
        
        for scraper in scrapers:
            try:
                logger.info(f"🔍 Running {scraper.source_name}...")
                results = scraper.run()
                
                for opp_data in results:
                    try:
                        ingest_opportunity(db, opp_data)
                        count += 1
                    except Exception as e:
                        logger.error(f"Error ingesting from {scraper.source_name}: {e}")
                
                logger.info(f"✅ {scraper.source_name}: {len(results)} opportunities")
                
            except Exception as e:
                logger.error(f"❌ {scraper.source_name} failed: {e}")
                continue
        
        db.close()
        logger.info(f"✅ Platform scrape complete: {count} opportunities")
        return {"source": "platforms", "count": count, "scrapers": len(scrapers)}
        
    except Exception as e:
        logger.error(f"Platform scrape failed: {e}")
        return {"source": "platforms", "error": str(e)}


@shared_task
def scrape_ecosystem_grants(ecosystem_id: str):
    """
    Scrape grants for a specific ecosystem.
    Can be called individually or as part of tier scraping.
    """
    db = SessionLocal()
    try:
        ecosystem = db.query(Ecosystem).filter(Ecosystem.id == ecosystem_id).first()
        if not ecosystem:
            logger.warning(f"Ecosystem {ecosystem_id} not found")
            return 0
        
        logger.info(f"📊 Scraping {ecosystem.name}...")
        
        # Check if ecosystem has grants URL
        if not ecosystem.official_grants_url:
            logger.warning(f"{ecosystem.name} has no grants URL")
            return 0
        
        # TODO: Implement ecosystem-specific scraping logic
        # For now, just log
        logger.info(f"Would scrape: {ecosystem.official_grants_url}")
        
        # Update scraping stats
        ecosystem.last_scraped_at = datetime.utcnow()
        ecosystem.scrape_count += 1
        db.commit()
        
        return 0  # TODO: Return actual count
        
    except Exception as e:
        logger.error(f"Error scraping ecosystem {ecosystem_id}: {e}")
        return 0
    finally:
        db.close()


@shared_task
def cleanup_old_opportunities():
    """
    Remove expired/old opportunities.
    Runs daily at 3 AM.
    """
    db = SessionLocal()
    try:
        # Remove opportunities older than 90 days with status "closed"
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        deleted = db.query(Opportunity).filter(
            Opportunity.deadline < cutoff_date,
            Opportunity.status == "closed"
        ).delete()
        
        db.commit()
        logger.info(f"🗑️ Cleaned up {deleted} old opportunities")
        return {"deleted": deleted}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@shared_task
def test_celery():
    """
    Simple test task to verify Celery is working.
    """
    logger.info("✅ Celery test task executed successfully!")
    return {"status": "success", "message": "Celery is working!"}
