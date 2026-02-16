# Integration test module for Playwright scrapers
import pytest
import datetime
from app.scrapers.heavy.devpost import DevpostScraper
from app.models.opportunity import Opportunity

@pytest.mark.asyncio
async def test_devpost_scraper_single_run():
    # Setup custom scraper instance with limited scope (if possible) for testing?
    # Or just run the real one. It iterates 10 items.
    # We want to confirm it doesn't crash and returns valid data.
    
    scraper = DevpostScraper()
    # Override URL for faster testing if needed, or stick to live.
    # scraper.base_url = "https://devpost.com/hackathons?search=blockchain&challenge_type[]=online" # Filter
    
    print("[TEST] Running Devpost scraper (live)...")
    try:
        results = await scraper.run_async()
        
        assert isinstance(results, list), "Scraper should return a list"
        
        # We expect at least *some* results if live site is up.
        # But allow 0 if network issues, just confirm *no crash*.
        if len(results) > 0:
            item = results[0]
            assert "title" in item
            assert "url" in item
            assert "source_id" in item
            assert "category" in item
            assert item["source"] == "Devpost"
            
            # Check ID format
            assert item["source_id"] != ""
            assert not item["source_id"].startswith("?")
            print(f"[TEST] Successfully scraped: {item['title']} (ID: {item['source_id']})")
        else:
            print("[TEST] Warning: Devpost scraped 0 items (check selectors/site).")
            
    except Exception as e:
        pytest.fail(f"Scraper crashed: {e}")

@pytest.mark.asyncio
async def test_devfolio_scraper_single_run():
    # Setup custom scraper
    from app.scrapers.heavy.devfolio import DevfolioScraper
    
    scraper = DevfolioScraper()
    print("[TEST] Running Devfolio scraper (live)...")
    try:
        results = await scraper.run_async()
        
        assert isinstance(results, list)
        
        if len(results) > 0:
            item = results[0]
            assert "source_id" in item
            assert item["source"] == "Devfolio"
            assert item["category"] == "Hackathon"
            print(f"[TEST] Successfully scraped: {item['title']} (ID: {item['source_id']})")
        else:
             print("[TEST] Warning: Devfolio scraped 0 items.")
             
    except Exception as e:
        pytest.fail(f"Devfolio scraper crashed: {e}")
