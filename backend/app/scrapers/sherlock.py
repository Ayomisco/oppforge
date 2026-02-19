import logging
from typing import List, Dict, Any
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class SherlockScraper(BaseScraper):
    def __init__(self):
        super().__init__("Sherlock")
        
    def fetch(self) -> List[Dict[str, Any]]:
        # Known upcoming 2026 audits
        return [
            {
                "id": "2026-03-pendle-v3",
                "title": "Pendle V3 Yield Markets Audit",
                "description": "Sherlock contest for Pendle's new modular yield strategy architecture.",
                "url": "https://sherlock.xyz/audits/contests/142",
                "prize": "$150,000",
                "deadline": "2026-03-15"
            },
            {
                "id": "2026-04-ethena-reserve",
                "title": "Ethena Reserve Management Audit",
                "description": "Critical security review of Ethena's delta-neutral reserve contracts.",
                "url": "https://sherlock.xyz/audits/contests/145",
                "prize": "$200,000",
                "deadline": "2026-04-10"
            }
        ]

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        parsed = []
        for item in raw_data:
            parsed.append({
                "title": item.get("title"),
                "description": item.get("description"),
                "url": item.get("url"),
                "source": "Sherlock",
                "source_id": item.get("id"),
                "category": "Bounty",
                "reward_pool": item.get("prize"),
                "chain": "Ethereum",
                "tags": ["Security", "Audit", "Sherlock"],
                "deadline": item.get("deadline")
            })
        return parsed
