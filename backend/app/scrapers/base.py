from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime

class BaseScraper(ABC):
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.results: List[Dict[str, Any]] = []

    @abstractmethod
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Fetch data from the source.
        Returns a list of raw data dictionaries.
        """
        pass

    @abstractmethod
    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse raw data into standardized Opportunity dictionaries.
        Standard format:
        {
            "title": str,              # Required
            "url": str,                # Required
            "description": str,
            "source": str,
            "source_id": str,
            "posted_at": datetime,
            "category": str,           # Grant, Hackathon, Bounty, Airdrop, etc.
            "tags": list,
            "chain": str,              # Ethereum, Solana, Multi-chain, etc.
            "reward_pool": str,        # e.g. "$50,000"
            "reward_token": str,       # e.g. "USDC"
            "estimated_value_usd": float,
            "start_date": datetime,    # When the opportunity opens/starts
            "deadline": datetime,      # When the opportunity closes
            "logo_url": str,
            "required_skills": list,   # e.g. ["Rust", "Solidity"]
            "is_verified": bool,
            "winner_count": int,       # Number of winners/positions
            "sub_category": str,       # DeFi, NFT, Infra, etc.
        }
        """
        pass

    def run(self) -> List[Dict[str, Any]]:
        """
        orchestrates the scrape: fetch -> parse -> deduplicate -> return
        """
        print(f"[{self.source_name}] Starting scrape...")
        try:
            raw = self.fetch()
            parsed = self.parse(raw)
            print(f"[{self.source_name}] Found {len(parsed)} items.")
            return parsed
        except Exception as e:
            print(f"[{self.source_name}] Error: {str(e)}")
            return []
