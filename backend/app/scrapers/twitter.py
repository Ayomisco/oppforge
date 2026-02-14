import httpx
import os
from typing import List, Dict, Any
from datetime import datetime
from .base import BaseScraper

class TwitterScraper(BaseScraper):
    def __init__(self):
        super().__init__("Twitter/X")
        self.api_key = os.getenv("RAPIDAPI_KEY")
        self.host = "twitter-api45.p.rapidapi.com"
        self.base_url = f"https://{self.host}"
        
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Fetch tweets using RapidAPI.
        Note: This is synchronous in the base class design, but we use httpx async.
        For simplicity in this sync method, we might need httpx.Client (sync) or run async loop.
        Using sync httpx.Client for compatibility.
        """
        if not self.api_key:
            print(f"[{self.source_name}] No API key found. Skipping.")
            return []

        queries = [
            "solana hackathon",
            "optimism grant",
            "ethereum bounty",
            "base airdrop"
        ]
        
        raw_results = []
        with httpx.Client(timeout=10.0) as client:
            for query in queries:
                try:
                    # Search Tweets Endpoint
                    response = client.get(
                        f"{self.base_url}/search.php",
                        params={
                            "query": query,
                            "type": "Latest"
                        },
                        headers={
                            "X-RapidAPI-Key": self.api_key,
                            "X-RapidAPI-Host": self.host
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        tweets = data.get("timeline", [])
                        # Attach query context to each tweet for category guessing
                        for t in tweets:
                            t["_query"] = query
                            raw_results.append(t)
                    else:
                        print(f"[{self.source_name}] API Error {response.status_code}")
                        
                except Exception as e:
                    print(f"[{self.source_name}] Exception for '{query}': {e}")
                    
        return raw_results

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        parsed_items = []
        unique_ids = set()
        
        for tweet in raw_data:
            tweet_id = tweet.get("tweet_id")
            if tweet_id in unique_ids:
                continue
                
            text = tweet.get("text", "")
            if len(text) < 30: # Filter short noise
                continue
                
            # Basic parsing logic
            query = tweet.get("_query", "")
            category = "Grant"
            if "hackathon" in query or "hackathon" in text.lower():
                category = "Hackathon"
            elif "bounty" in query or "bounty" in text.lower():
                category = "Bounty"
            elif "airdrop" in query or "airdrop" in text.lower():
                category = "Airdrop"

            unique_ids.add(tweet_id)
            parsed_items.append({
                "title": f"New {category} Opportunity: {text[:50]}...",
                "description": text,
                "url": f"https://twitter.com/x/status/{tweet_id}",
                "source": "Twitter",
                "source_id": str(tweet_id),
                "category": category,
                "chain": "Multi-chain",
                "posted_at": datetime.now(), # RapidAPI might give 'created_at' e.g. "Fri Feb 14..."
                "tags": [category, "Twitter"],
                "ai_score": 50 # Default
            })
            
        return parsed_items
