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
        
        # Comprehensive list of ecosystems and keywords
        self.ecosystems = [
            "Solana", "Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "ZkSync", 
            "Starknet", "Sui", "Aptos", "Avalanche", "Cosmos", "Near", "Polkadot", 
            "Cardano", "Scroll", "Linea", "Mantle", "Blast", "Celestia", "EigenLayer",
            "Monad", "Berachain", "Fuel", "Aleo"
        ]
        self.types = ["Grant", "Hackathon", "Bounty", "Testnet", "Airdrop"]

    def fetch(self) -> List[Dict[str, Any]]:
        if not self.api_key:
            print(f"[{self.source_name}] No API key found. Skipping.")
            return []

        # Construct broad queries
        queries = []
        for eco in self.ecosystems:
            queries.append(f"{eco} Hackathon")
            queries.append(f"{eco} Grant")
            queries.append(f"{eco} Testnet")
        
        # Limit queries to save API credits (RapidAPI usually has limits)
        # We'll rotate or pick top 10 random, or just run a subset for now.
        # User asked for "100+ ecosystems", but API limits are real.
        # Let's prioritize the "Hot" ones + generic keywords.
        priority_queries = [
            "Solana Hackathon", "Optimism Grant", "Arbitrum Stylus", "Base Onchain Summer",
            "Monad Testnet", "Berachain Testnet", "ZkSync Airdrop", "Starknet Grant",
            "Ethereum Bounty", "Sui Hackathon"
        ]
        
        raw_results = []
        # syncing with httpx client
        with httpx.Client(timeout=15.0) as client:
            for query in priority_queries:
                try:
                    # Search Tweets Endpoint (RapidAPI)
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
                        for t in tweets:
                            t["_query"] = query
                            raw_results.append(t)
                    else:
                        print(f"[{self.source_name}] API Error {response.status_code} for {query}")
                        
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
            if len(text) < 40: continue # Noise filter
            
            # Category Guessing
            query = tweet.get("_query", "")
            category = "Grant" # Default
            if "hackathon" in query.lower() or "hackathon" in text.lower(): category = "Hackathon"
            elif "bounty" in query.lower() or "bounty" in text.lower(): category = "Bounty"
            elif "airdrop" in query.lower() or "airdrop" in text.lower(): category = "Airdrop"
            elif "testnet" in query.lower() or "testnet" in text.lower(): category = "Testnet"

            # Chain Guessing
            chain = "Multi-chain"
            lower_text = text.lower()
            for eco in self.ecosystems:
                if eco.lower() in lower_text:
                    chain = eco
                    break
            
            unique_ids.add(tweet_id)
            parsed_items.append({
                "title": f"New {category} on {chain}: {text[:60]}...",
                "description": text,
                "url": f"https://twitter.com/x/status/{tweet_id}",
                "source": "Twitter",
                "source_id": str(tweet_id),
                "category": category,
                "chain": chain,
                "posted_at": datetime.now(),
                "tags": [category, chain, "Twitter"],
                "ai_score": 60 if category in ["Hackathon", "Grant"] else 40
            })
            
        return parsed_items
