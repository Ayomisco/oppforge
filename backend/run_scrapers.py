#!/usr/bin/env python3
"""
OppForge Scraper Runner — CLI entry point for running scrapers.

Usage:
    python run_scrapers.py                   # Run all scrapers
    python run_scrapers.py --source superteam  # Run specific scraper
    python run_scrapers.py --source curated    # Run curated events only
    python run_scrapers.py --list              # List available scrapers
    python run_scrapers.py --dry-run           # Show what would be scraped without saving
"""

import sys
import os
import argparse
import logging
from datetime import datetime

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.opportunity import Opportunity

# Import all scrapers
from app.scrapers.superteam import SuperteamScraper
from app.scrapers.dorahacks import DoraHacksScraper
from app.scrapers.code4rena import Code4renaScraper
from app.scrapers.curated import CuratedScraper
from app.scrapers.hackquest import HackQuestScraper
from app.scrapers.questbook import QuestbookScraper

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Registry of all available scrapers
SCRAPER_REGISTRY = {
    "superteam": SuperteamScraper,
    "dorahacks": DoraHacksScraper,
    "code4rena": Code4renaScraper,
    "curated": CuratedScraper,
    "hackquest": HackQuestScraper,
    "questbook": QuestbookScraper,
}


def save_opportunities(db, opportunities: list) -> int:
    """Save scraped opportunities to DB with deduplication."""
    saved = 0
    skipped = 0

    for opp_data in opportunities:
        try:
            source = opp_data.get("source", "Unknown")
            source_id = opp_data.get("source_id")
            title = opp_data.get("title", "")
            url = opp_data.get("url", "")

            # Dedup check 1: source_id + source
            if source_id:
                exists = db.query(Opportunity).filter(
                    Opportunity.source_id == str(source_id),
                    Opportunity.source == source
                ).first()
                if exists:
                    skipped += 1
                    continue

            # Dedup check 2: URL match
            if url:
                exists = db.query(Opportunity).filter(Opportunity.url == url).first()
                if exists:
                    skipped += 1
                    continue

            # Dedup check 3: Title match
            if title:
                exists = db.query(Opportunity).filter(Opportunity.title == title).first()
                if exists:
                    skipped += 1
                    continue

            # Build slug from title
            slug = title.lower().replace(" ", "-").replace("'", "")[:80] if title else None
            # Ensure slug uniqueness
            if slug:
                slug_exists = db.query(Opportunity).filter(Opportunity.slug == slug).first()
                if slug_exists:
                    slug = f"{slug}-{source.lower()}"

            # Create opportunity
            opp = Opportunity(
                title=title,
                slug=slug,
                description=opp_data.get("description", ""),
                url=url,
                logo_url=opp_data.get("logo_url"),
                source=source,
                source_id=str(source_id) if source_id else None,
                source_url=opp_data.get("source_url", url),
                category=opp_data.get("category", "Hackathon"),
                sub_category=opp_data.get("sub_category"),
                chain=opp_data.get("chain", "Multi-chain"),
                tags=opp_data.get("tags", []),
                reward_pool=opp_data.get("reward_pool"),
                reward_token=opp_data.get("reward_token"),
                estimated_value_usd=opp_data.get("estimated_value_usd"),
                deadline=opp_data.get("deadline"),
                start_date=opp_data.get("start_date"),
                is_open=True,
                ai_score=opp_data.get("ai_score", 70),  # Default reasonable score
                trust_score=opp_data.get("trust_score", 80),
                difficulty=opp_data.get("difficulty", "Intermediate"),
                required_skills=opp_data.get("required_skills", []),
                is_verified=opp_data.get("is_verified", False),
            )

            db.add(opp)
            db.commit()
            db.refresh(opp)
            saved += 1
            logger.info(f"  ✅ Saved: {title[:60]}")

        except Exception as e:
            logger.error(f"  ❌ Error saving '{opp_data.get('title', '?')}': {e}")
            db.rollback()
            continue

    return saved, skipped


def run_scraper(name: str, scraper_cls, db, dry_run=False):
    """Run a single scraper and save results."""
    logger.info(f"\n{'='*60}")
    logger.info(f"🔍 Running: {name.upper()}")
    logger.info(f"{'='*60}")

    try:
        scraper = scraper_cls()
        results = scraper.run()
        logger.info(f"📦 {name}: {len(results)} opportunities found")

        if dry_run:
            for r in results:
                logger.info(f"  [DRY] {r.get('title', '?')[:60]} — {r.get('category', '?')} — {r.get('reward_pool', 'TBD')}")
            return len(results), 0
        else:
            saved, skipped = save_opportunities(db, results)
            logger.info(f"💾 {name}: {saved} saved, {skipped} skipped (duplicates)")
            return saved, skipped

    except Exception as e:
        logger.error(f"❌ {name} failed: {e}")
        import traceback
        traceback.print_exc()
        return 0, 0


def main():
    parser = argparse.ArgumentParser(description="OppForge Scraper Runner")
    parser.add_argument("--source", type=str, help="Run a specific scraper (e.g., superteam, dorahacks)")
    parser.add_argument("--list", action="store_true", help="List available scrapers")
    parser.add_argument("--dry-run", action="store_true", help="Show results without saving to DB")
    args = parser.parse_args()

    if args.list:
        print("\n📋 Available Scrapers:")
        for name, cls in SCRAPER_REGISTRY.items():
            print(f"  • {name:15s} — {cls.__name__}")
        print(f"\nTotal: {len(SCRAPER_REGISTRY)} scrapers")
        return

    db = SessionLocal()
    total_saved = 0
    total_skipped = 0
    start_time = datetime.utcnow()

    try:
        if args.source:
            # Run specific scraper
            name = args.source.lower()
            if name not in SCRAPER_REGISTRY:
                print(f"❌ Unknown scraper: {name}")
                print(f"Available: {', '.join(SCRAPER_REGISTRY.keys())}")
                return
            saved, skipped = run_scraper(name, SCRAPER_REGISTRY[name], db, args.dry_run)
            total_saved += saved
            total_skipped += skipped
        else:
            # Run all scrapers
            logger.info(f"🚀 Running ALL {len(SCRAPER_REGISTRY)} scrapers...")
            for name, cls in SCRAPER_REGISTRY.items():
                saved, skipped = run_scraper(name, cls, db, args.dry_run)
                total_saved += saved
                total_skipped += skipped

        elapsed = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"\n{'='*60}")
        logger.info(f"✅ SCRAPE COMPLETE in {elapsed:.1f}s")
        logger.info(f"   Saved: {total_saved} | Skipped: {total_skipped}")
        logger.info(f"{'='*60}")

        # Show current DB count
        count = db.query(Opportunity).count()
        logger.info(f"📊 Total opportunities in DB: {count}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
