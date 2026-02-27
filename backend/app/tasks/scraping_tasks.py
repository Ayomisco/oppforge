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
        
        scrapers = [
            GitcoinScraper(),
            DoraHacksScraper(),
            QuestbookScraper(),
            HackQuestScraper(),
            SuperteamScraper(),
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
    2-Phase opportunity lifecycle management. Runs daily at 3 AM.

    Phase 1 — ARCHIVE (Soft Close):
        Opportunities whose deadline has passed but are still marked is_open=True
        get flipped to is_open=False. They are removed from the Priority Stream
        and live feed but remain fully browseable in the database (search,
        opportunity detail page, tracker history).

    Phase 2 — PURGE (Hard Delete):
        Opportunities that have been archived (is_open=False) for over 90 days
        AND have no active tracked applications are permanently deleted to keep
        the database lean.

    Note: We intentionally NEVER hard-delete opportunities that have active
    tracker entries (users are still referencing them in their Mission Control).
    """
    db = SessionLocal()
    now = datetime.utcnow()

    try:
        # ── Phase 1: Auto-Archive Expired Opportunities ──────────────────────
        # Any opportunity with a passed deadline that is still showing as open
        expired_opps = db.query(Opportunity).filter(
            Opportunity.is_open == True,
            Opportunity.deadline != None,
            Opportunity.deadline < now
        ).all()

        archived_count = 0
        for opp in expired_opps:
            opp.is_open = False
            archived_count += 1

        if archived_count:
            db.commit()
            logger.info(f"📁 Archived {archived_count} expired opportunities (hidden from feed, kept in DB)")

        # ── Phase 2: Hard-Purge Very Old Archived Opportunities ──────────────
        # Only permanently delete opportunities that:
        #   • Are already closed (is_open=False)
        #   • Deadline expired more than 90 days ago
        #   • Have NO tracked applications from any user (safe to wipe)
        cutoff = now - timedelta(days=90)

        from app.models.tracking import TrackedApplication
        from sqlalchemy import not_, exists

        # Subquery: IDs that have at least one tracked application
        has_trackers = exists().where(
            TrackedApplication.opportunity_id == Opportunity.id
        )

        stale_opps = db.query(Opportunity).filter(
            Opportunity.is_open == False,
            Opportunity.deadline != None,
            Opportunity.deadline < cutoff,
            not_(has_trackers)
        ).all()

        purged_count = 0
        for opp in stale_opps:
            db.delete(opp)
            purged_count += 1

        db.commit()

        logger.info(f"🗑️ Purged {purged_count} stale opportunities (90+ days old, no trackers)")
        return {
            "archived": archived_count,
            "purged": purged_count,
            "timestamp": now.isoformat()
        }

    except Exception as e:
        logger.error(f"Cleanup task failed: {e}")
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
