from .base_scraper import BasePlaywrightScraper
from bs4 import BeautifulSoup
import asyncio
import urllib.parse
from datetime import datetime
import random

from app.database import SessionLocal
from app.models.ecosystem import Ecosystem
from app.core.search_queries import get_search_queries

class TwitterPlaywrightScraper(BasePlaywrightScraper):
    def __init__(self):
        super().__init__()
        self.source_name = "Twitter/X (Async)"
        # Nitter instances to rotate
        self.instances = [
            "https://nitter.net",
            "https://xcancel.com", 
            "https://nitter.cz",
            "https://nitter.privacydev.net"
        ]
        
    def _generate_dynamic_queries(self):
        """Fetches ecosystems from DB and creates targeted queries with metadata."""
        db = SessionLocal()
        try:
            ecosystems = db.query(Ecosystem).all()
            queries = []
            
            # 1. Broad Social Phrases (Chain: Multi-chain/Unknown)
            for q in get_search_queries():
                queries.append({"q": q, "chain": "Multi-chain"})
            
            # 2. Ecosystem Specific
            for eco in ecosystems:
                # Basic
                queries.append({"q": f"{eco.name} Grant", "chain": eco.name})
                queries.append({"q": f"{eco.name} Hackathon", "chain": eco.name})
                
                # Targeted based on type
                if eco.type in ["L1", "L2"]:
                     queries.append({"q": f"Build on {eco.name}", "chain": eco.name})
                     queries.append({"q": f"{eco.name} developer incentive", "chain": eco.name})
                
                if eco.has_bounties:
                    queries.append({"q": f"{eco.name} Bounty", "chain": eco.name})
                
                if eco.has_hackathons:
                    queries.append({"q": f"{eco.name} global hackathon", "chain": eco.name})

            return queries 
        finally:
            db.close()
            
    async def run_async(self):
        print(f"[{self.source_name}] Starting scrape via Playwright...")
        
        # Freshly generate queries from DB
        all_queries_data = self._generate_dynamic_queries()
        # Deduplicate based on query string
        unique_queries = {item['q']: item for item in all_queries_data}.values()
        all_queries = list(unique_queries)
        
        print(f"[{self.source_name}] Generated {len(all_queries)} targeted queries from DB + Static list.")
        
        opportunities = []
        
        try:
            page = await self._get_page()
            
            # Simple rotation logic
            random.shuffle(self.instances)
            
            # Pick a subset of 5 random queries per run to spread load
            queries_subset = random.sample(all_queries, 5) if len(all_queries) > 5 else all_queries
            
            for query_item in queries_subset: 
                query = query_item["q"]
                chain_context = query_item["chain"]
                
                found_for_query = False
                for instance in self.instances:
                    if found_for_query: break
                    
                    try:
                        encoded_query = urllib.parse.quote(query + " since:2026-01-01")
                        # Search since 2026 to ensure freshness
                        url = f"{instance}/search?f=tweets&q={encoded_query}"
                        
                        print(f"[{self.source_name}] Navigating to {instance} for '{query}'...")
                        
                        try:
                            # Use safe_goto from base to handle stealth
                            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                        except Exception as nav_e:
                            print(f"[{self.source_name}] Timeout/Error on {instance}: {nav_e}")
                            continue
                            
                        # Wait for timeline
                        try:
                            # Nitter can be slow
                            await page.wait_for_selector(".timeline-item", timeout=15000)
                        except:
                            # Verify if maybe 429?
                            content = await page.content()
                            if "Rate limit" in content or "Upstream Error" in content:
                                print(f"[{self.source_name}] Rate limited/Error on {instance}.")
                                continue
                            print(f"[{self.source_name}] No timeline items (or timeout) on {instance}.")
                            continue

                        # Parse Content
                        content = await page.content()
                        soup = BeautifulSoup(content, 'html.parser')
                        tweets = soup.select(".timeline-item")
                        
                        if not tweets: continue
                        
                        print(f"[{self.source_name}] Found {len(tweets)} tweets on {instance}.")
                        found_for_query = True
                        
                        for t in tweets:
                            content_div = t.select_one(".tweet-content")
                            if not content_div: continue
                            text = content_div.get_text(strip=True)
                            
                            # Heuristic filter
                            if len(text) < 30: continue
                            lower = text.lower()
                            keywords = ["apply", "register", "deadline", "prize", "submit", "live", "now open", "won", "shipping"]
                            if not any(k in lower for k in keywords): continue

                            link_tag = t.select_one(".tweet-link")
                            href = link_tag["href"] if link_tag else ""
                            # Nitter href is usually relative /user/status/id
                            tweet_id = href.split("/")[-1].replace("#m", "") if href else str(random.randint(100000, 999999))
                            full_url = f"https://twitter.com{href}" if href else ""
                            
                            # Category
                            cat = "Grant"
                            if "hackathon" in lower: cat = "Hackathon"
                            elif "bounty" in lower: cat = "Bounty"
                            elif "testnet" in lower: cat = "Testnet"
                            
                            opp = {
                                "source": "Twitter",
                                "source_id": tweet_id,
                                "url": full_url,
                                "title": text[:50] + "...",
                                "description": text,
                                "category": cat,
                                "chain": chain_context, # Use context from query!
                                "reward_pool": "See Details",
                                "deadline": datetime.now().strftime("%Y-%m-%d"),
                                "tags": ["Twitter", cat, chain_context]
                            }
                            opportunities.append(opp)
                            
                    except Exception as e:
                        print(f"[{self.source_name}] Error scraping {instance}: {e}")
            
        except Exception as e:
            print(f"[{self.source_name}] Critical Error: {e}")
        finally:
            await self._close()
            
        print(f"[{self.source_name}] Scraped {len(opportunities)} items total.")
        return opportunities
