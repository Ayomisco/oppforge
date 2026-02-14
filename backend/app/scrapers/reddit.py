import httpx
from typing import List, Dict, Any
from datetime import datetime
from .base import BaseScraper

class RedditScraper(BaseScraper):
    def __init__(self):
        super().__init__("Reddit")
        # Public JSON endpoints for subreddits
        self.subreddits = ["ethdev", "solana", "cryptocurrency", "rust", "web3"]
        self.base_url = "https://www.reddit.com/r"

    def fetch(self) -> List[Dict[str, Any]]:
        raw_results = []
        
        # Requests to Reddit often require a User-Agent to avoid 429 warnings
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"}
        
        with httpx.Client(timeout=10.0, headers=headers) as client:
            for sub in self.subreddits:
                try:
                    url = f"{self.base_url}/{sub}/new.json?limit=25"
                    response = client.get(url)
                    
                    if response.status_code == 200:
                        data = response.json()
                        posts = data.get("data", {}).get("children", [])
                        for post in posts:
                            # Attach subreddit context
                            post_data = post.get("data", {})
                            post_data["_subreddit"] = sub
                            raw_results.append(post_data)
                    else:
                        print(f"[{self.source_name}] Error {response.status_code} for r/{sub}")
                except Exception as e:
                    print(f"[{self.source_name}] Exception for r/{sub}: {e}")
                    
        return raw_results

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        parsed_items = []
        unique_ids = set()
        
        # Keywords to identify opportunities vs just discussion
        opp_keywords = ["hackathon", "grant", "bounty", "apply", "hiring", "job", "career", "testnet", "airdrop"]
        
        for post in raw_data:
            pid = post.get("id")
            if pid in unique_ids:
                continue
                
            title = post.get("title", "")
            selftext = post.get("selftext", "")
            subreddit = post.get("_subreddit", "")
            
            # Simple filter: must contain opportunity keywords
            combined_text = (title + " " + selftext).lower()
            if not any(k in combined_text for k in opp_keywords):
                continue

            # Guess Category
            category = "Grant" # Default catch-all
            if "hackathon" in combined_text: category = "Hackathon"
            elif "bounty" in combined_text: category = "Bounty"
            elif "airdrop" in combined_text: category = "Airdrop"
            elif "testnet" in combined_text: category = "Testnet"
            
            unique_ids.add(pid)
            parsed_items.append({
                "title": title[:100],
                "description": selftext[:500] or title, # Truncate for DB
                "url": post.get("url") or f"https://reddit.com{post.get('permalink')}",
                "source": "Reddit",
                "source_id": pid,
                "category": category,
                "chain": "Multi-chain", # Could infer from subreddit (e.g. solana -> Solana)
                "posted_at": datetime.fromtimestamp(post.get("created_utc", 0)),
                "tags": [category, "Reddit", subreddit],
                "ai_score": 40 + (post.get("score", 0) % 20) # Score based on upvotes roughly
            })
            
        return parsed_items
