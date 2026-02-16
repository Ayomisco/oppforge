from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import asyncio
import logging
import random
import re
from datetime import datetime
from app.scrapers.heavy.base_scraper import BasePlaywrightScraper

class DevpostScraper(BasePlaywrightScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://devpost.com/hackathons?search=blockchain&challenge_type[]=online&sort_by=Submission+Deadline"
        self.logger = logging.getLogger("DevpostScraper")
        
    async def run_async(self):
        async with async_playwright() as p:
            # Launch Stealth Browser
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
            page = await context.new_page()
            
            self.logger.info(f"Connecting to Devpost...")
            
            try:
                # Use domcontentloaded for faster initial render + manual wait
                self.logger.info(f"Navigating to {self.base_url} (wait=domcontentloaded)...")
                await page.goto(self.base_url, wait_until="domcontentloaded", timeout=90000)
                
                # Scroll to load dynamic content
                self.logger.info("Page loaded. Scrolling...")
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                await asyncio.sleep(5) # Give JS time to fetch
                
                # Get Hackathon Cards
                cards = await page.content()
                soup = BeautifulSoup(cards, 'lxml')
                
                hackathons = []
                # Devpost class selectors change frequently, so we rely on parent containers
                # Looking for 'hackathon-tile' or generic tile classes
                blocks = soup.select("a.hackathon-tile, .hackathon-tile a")
                
                for block in blocks[:10]: # Limit to top 10 for speed
                    tile = block.find_parent("div", class_="hackathon-tile") or block
                    
                    title_elem = tile.select_one("h3.mb-4, .title")
                    if not title_elem: continue
                    title = title_elem.get_text(strip=True)
                    
                    # Url
                    url = block.get("href")
                    if not url.startswith("http"): url = "https://devpost.com" + url
                    
                    # Robust ID: Use title slug if URL path is empty
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    clean_path = parsed.path.strip("/")
                    
                    # Simple slugify
                    slug = re.sub(r'[^a-z0-9]', '-', title.lower()).strip('-')
                    slug = re.sub(r'-+', '-', slug)
                    
                    if clean_path and len(clean_path) > 1:
                        source_id = clean_path.split("/")[-1]
                        # Verify it's not generic
                        if source_id in ['hackathons', 'software', 'submission-gallery']:
                             source_id = slug
                    else:
                        source_id = slug
                    
                    full_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                    
                    # Prize
                    prize_elem = tile.select_one(".prize-amount, .prize") 
                    prize = prize_elem.get_text(strip=True) if prize_elem else "TBA"
                    
                    # Deadline
                    time_elem = tile.select_one(".submission-period, .deadline")
                    deadline_text = time_elem.get_text(strip=True) if time_elem else None
                    # Attempt simple parsing (e.g. "Jul 15")
                    
                    # Theme/Tags
                    tags = []
                    theme_elems = tile.select(".theme-label, .tag")
                    for t in theme_elems:
                        tags.append(t.get_text(strip=True))
                        
                    item = {
                        "source": "Devpost",
                        "source_id": source_id,
                        "url": full_url,
                        "title": title,
                        "category": "Hackathon",
                        "tags": tags,
                        "reward_pool": prize,
                        "description": f"Hackathon on Devpost: {title}. Prize pool: {prize}. Themes: {', '.join(tags)}",
                        "chain": "Multi-chain" if "blockchain" in tags else "Unknown",
                        "deadline": deadline_text # In ingest pipeline, we need NLP to parse "Jul 15"
                    }
                    hackathons.append(item)
                    
                self.logger.info(f"Extracted {len(hackathons)} hackathons from Devpost.")
                return hackathons
                    
            except Exception as e:
                self.logger.error(f"Devpost scrape failed: {e}")
                import traceback
                traceback.print_exc()
                return []
            finally:
                await browser.close()
