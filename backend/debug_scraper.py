import asyncio
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("DevpostDebug")

from app.scrapers.heavy.devpost import DevpostScraper

async def debug_run():
    logger.info("Starting Devpost Scraper Debug...")
    try:
        scraper = DevpostScraper()
        logger.info(f"Initialized Scraper. URL: {scraper.base_url}")
        
        results = await scraper.run_async()
        
        logger.info(f"Results Count: {len(results)}")
        for item in results:
            logger.info(f"FOUND: {item['title']} - {item['reward_pool']}")
            
    except Exception as e:
        logger.error(f"Scraper Failed: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(debug_run())
