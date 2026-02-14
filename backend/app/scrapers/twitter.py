import httpx
import os
import random
from typing import List, Dict, Any
from datetime import datetime
from bs4 import BeautifulSoup
from .base import BaseScraper

class TwitterScraper(BaseScraper):
    def __init__(self):
        super().__init__("Twitter/X")
        self.api_key = os.getenv("RAPIDAPI_KEY")
        # Switching to twitter154 as per user request
        self.host = "twitter154.p.rapidapi.com" 
        self.base_url = f"https://{self.host}"
        
        # Fallback Nitter instances
        self.nitter_instances = [
            "https://nitter.net",
            "https://xcancel.com",
            "https://nitter.cz",
            "https://nitter.privacydev.net"
        ]

    def fetch(self) -> List[Dict[str, Any]]:
        results = []
        
        # 1. Try RapidAPI First
        if self.api_key:
            print(f"[{self.source_name}] Trying RapidAPI ({self.host})...")
            results = self._fetch_rapidapi()
            
        # 2. Fallback to Nitter if empty
        if not results:
            print(f"[{self.source_name}] RapidAPI failed or empty. Trying Nitter fallback...")
            results = self._fetch_nitter()
            
        return results

    def _fetch_rapidapi(self) -> List[Dict[str, Any]]:
        raw_data = []
        ecosystems = ["Solana", "Ethereum", "Base", "Arbitrum", "Monad"]
        types = ["Hackathon", "Grant", "Bounty"]
        
        # Randomized queries to avoid hit limits per run
        queries = [f"{e} {t}" for e in ecosystems for t in types]
        random.shuffle(queries)
        
        with httpx.Client(timeout=15.0) as client:
            for query in queries[:5]: # Limit to 5 queries per run for now
                try:
                    # twitter154 endpoint: /search/search
                    response = client.get(
                        f"{self.base_url}/search/search",
                        params={
                            "query": query,
                            "section": "top",
                            "limit": 20
                        },
                        headers={
                            "X-RapidAPI-Key": self.api_key,
                            "X-RapidAPI-Host": self.host
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        # Structure varies by API. Assuming 'results' or similar. 
                        # Inspecting standard twitter154 response: it usually returns 'results' list or 'timeline'
                        # We'll try to adapt.
                        tweets = data.get("results", []) or data.get("timeline", [])
                        for t in tweets:
                            t["_query"] = query
                            raw_data.append(t)
                        print(f"[{self.source_name}] RapidAPI for '{query}': Found {len(tweets)} tweets.")
                    else:
                        print(f"[{self.source_name}] RapidAPI Error {response.status_code}: {response.text[:100]}")
                        
                except Exception as e:
                    print(f"[{self.source_name}] RapidAPI Exception: {e}")
                    
        return raw_data

    def _fetch_nitter(self) -> List[Dict[str, Any]]:
        raw_data = []
        # Nitter scraping is fragile. We iterate instances.
        import time
        
        queries = ["crypto grant", "web3 hackathon", "solana bounty"]
        
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            for query in queries:
                success = False
                for instance in self.nitter_instances:
                    if success: break
                    try:
                        # Nitter search URL: /search?f=tweets&q=...
                        url = f"{instance}/search"
                        res = client.get(url, params={"f": "tweets", "q": query})
                        
                        if res.status_code == 200:
                            soup = BeautifulSoup(res.text, "html.parser")
                            tweets = soup.select(".timeline-item")
                            
                            for t in tweets:
                                # Parse HTML
                                content_div = t.select_one(".tweet-content")
                                if not content_div: continue
                                text = content_div.get_text(strip=True)
                                
                                link_tag = t.select_one(".tweet-link")
                                href = link_tag["href"] if link_tag else ""
                                tweet_id = href.split("/")[-1].replace("#m", "") if href else str(random.randint(1000,9999))
                                
                                raw_data.append({
                                    "tweet_id": tweet_id,
                                    "text": text,
                                    "_query": query,
                                    "creation_date": datetime.now().isoformat() # Approx
                                })
                            
                            print(f"[{self.source_name}] Nitter ({instance}) for '{query}': Found {len(tweets)} tweets.")
                            success = True
                        else:
                            print(f"[{self.source_name}] Nitter ({instance}) failed: {res.status_code}")
                            
                    except Exception as e:
                        print(f"[{self.source_name}] Nitter ({instance}) error: {e}")
                        
        return raw_data

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        parsed_items = []
        unique_ids = set()
        
        for tweet in raw_data:
            # Handle both JSON (RapidAPI) and Dict (Nitter) structures
            tweet_id = tweet.get("tweet_id") or tweet.get("id_str")
            if tweet_id in unique_ids:
                continue
                
            text = tweet.get("text") or tweet.get("full_text", "")
            if len(text) < 20: continue
            
            query = tweet.get("_query", "")
            
            # Simple keyword categorization
            category = "Grant"
            lower_text = text.lower()
            if "hackathon" in lower_text: category = "Hackathon"
            elif "bounty" in lower_text: category = "Bounty"
            elif "airdrop" in lower_text: category = "Airdrop"
            elif "testnet" in lower_text: category = "Testnet"

            unique_ids.add(tweet_id)
            parsed_items.append({
                "title": f"New {category} Opportunity ({query.split()[0]})",
                "description": text,
                "url": f"https://twitter.com/x/status/{tweet_id}",
                "source": "Twitter",
                "source_id": str(tweet_id),
                "category": category,
                "chain": query.split()[0] if query else "Multi-chain",
                "posted_at": datetime.now(),
                "tags": [category, "Twitter"],
                "ai_score": 50 + (len(text) % 40)
            })
            
        return parsed_items
