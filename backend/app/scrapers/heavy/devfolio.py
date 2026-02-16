from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import asyncio
import logging
import random
import re
from datetime import datetime
from .base_scraper import BasePlaywrightScraper

class DevfolioScraper(BasePlaywrightScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "Devfolio"
        self.base_url = "https://devfolio.co/hackathons"
        
    async def run_async(self):
        print(f"[{self.source_name}] Starting scrape...")
        opportunities = []

        try:
            page = await self._get_page()
            
            # Devfolio is dynamic. We need to wait for cards.
            print(f"[{self.source_name}] Navigating to {self.base_url}")
            try:
                await page.goto(self.base_url, wait_until="domcontentloaded", timeout=60000)
                await asyncio.sleep(5) # Wait for hydration
            except Exception as e:
                print(f"[{self.source_name}] Navigation error (ignored): {e}")

            # Wait for any anchor tag that looks like a hackathon link
            # Devfolio hackathon URLs usually are subdomains or contain specific classes
            # Simple heuristic: Look for 'Apply now' or 'View details' buttons OR h2/h3 tags inside links
            
            await self._auto_scroll(page)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Strategy: Find container divs that look like cards
            # Or just grab all links and filter
            links = soup.find_all('a', href=True)
            
            seen_urls = set()
            
            for link in links:
                href = link['href']
                
                # Filter for hackathon links
                # Devfolio URLs are often like: https://hackathon-name.devfolio.co/
                # or /hackathons/slug
                is_hackathon = 'devfolio.co' in href and not 'devfolio.co/hackathons' in href # Subdomains
                
                if is_hackathon:
                    if href in seen_urls: continue
                    seen_urls.add(href)
                    
                    # Extract info from parent or link itself
                    title = link.get_text(strip=True)
                    if not title or len(title) < 4:
                        # Maybe title is inside an h2/h3 child?
                        h_tag = link.find(['h2', 'h3', 'h4'])
                        if h_tag: title = h_tag.get_text(strip=True)
                        else: continue # Skip if no title
                        
                    # Slug ID
                    parsed = re.sub(r'https?://', '', href).split('/')[0] # subdomain as ID usually
                    if 'devfolio.co' in parsed:
                        slug = parsed.replace('.devfolio.co', '')
                    else:
                        slug = re.sub(r'[^a-z0-9]', '-', title.lower())
                        
                    item = {
                        "source": "Devfolio",
                        "source_id": slug,
                        "url": href,
                        "title": title,
                        "category": "Hackathon",
                        "reward_pool": "See details",
                        "description": f"Hackathon found on Devfolio: {title}",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "chain": "Multi-chain",
                        "tags": ["Hackathon", "Devfolio"]
                    }
                    opportunities.append(item)
                    if len(opportunities) >= 15: break
            
        except Exception as e:
            print(f"[{self.source_name}] Error: {e}")
        finally:
            await self._close()
            
        print(f"[{self.source_name}] Scraped {len(opportunities)} items.")
        return opportunities
