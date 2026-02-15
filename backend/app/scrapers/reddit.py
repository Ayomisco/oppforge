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
        opportunity_patterns = {
            "Grant": ["grants", "funding", "program", "apply for", "developer grant"],
            "Hackathon": ["hackathon", "buidl", "code challenge", "prize pool"],
            "Bounty": ["bounty", "bug bounty", "issue", "reward for"],
            "Airdrop": ["airdrop", "alpha", "eligible", "snapshot"],
            "Testnet": ["testnet", "incentivized", "node operator", "validator program"]
        }
        
        for post in raw_data:
            pid = post.get("id")
            if pid in unique_ids:
                continue
                
            title = post.get("title", "")
            selftext = post.get("selftext", "")
            subreddit = post.get("_subreddit", "")
            
            combined_text = (title + " " + selftext).lower()
            
            # Identify category and verify it's a real opportunity
            found_category = None
            for cat, keywords in opportunity_patterns.items():
                if any(k in combined_text for k in keywords):
                    found_category = cat
                    break
            
            if not found_category:
                continue

            # Bonus score for specific actionable phrases
            action_bonus = 0
            if any(x in combined_text for x in ["apply now", "register", "deadline", "prize", "submit"]):
                action_bonus = 15
            
            unique_ids.add(pid)
            parsed_items.append({
                "title": title[:100],
                "description": selftext[:800] or title,
                "url": post.get("url") or f"https://reddit.com{post.get('permalink')}",
                "source": "Reddit",
                "source_id": pid,
                "category": found_category,
                "chain": subreddit.capitalize(),
                "posted_at": datetime.fromtimestamp(post.get("created_utc", 0)),
                "tags": [found_category, "Reddit", subreddit],
                "ai_score": min(45 + action_bonus + (post.get("ups", 0) // 10), 95)
            })
            
        return parsed_items
