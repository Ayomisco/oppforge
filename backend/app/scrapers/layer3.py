import logging
from typing import List, Dict, Any
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class Layer3Scraper(BaseScraper):
    def __init__(self):
        super().__init__("Layer3")
        
    def fetch(self) -> List[Dict[str, Any]]:
        # Layer3 focuses on chains and ecosystem launches
        return [
            {
                "id": "monad-testnet-quest",
                "title": "Monad Testnet Journey",
                "description": "Explore the Monad ecosystem. Interact with testnet bridges and swap protocols to earn future potential rewards.",
                "url": "https://layer3.xyz/quests/monad-testnet",
                "reward": "Exp + Potential Airdrop",
                "chain": "Monad"
            },
            {
                "id": "linea-park-v2",
                "title": "Linea Park: Builders Edition",
                "description": "Special quest for developers on Linea. Complete technical tasks to earn Linea LXP-L.",
                "url": "https://layer3.xyz/quests/linea-park",
                "reward": "LXP-L Tokens",
                "chain": "Linea"
            }
        ]

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        parsed = []
        for item in raw_data:
            parsed.append({
                "title": item.get("title"),
                "description": item.get("description"),
                "url": item.get("url"),
                "source": "Layer3",
                "source_id": item.get("id"),
                "category": "Reward", # Or Airdrop
                "reward_pool": item.get("reward"),
                "chain": item.get("chain"),
                "tags": ["Quest", "Layer3", item.get("chain"), "Gamified"]
            })
        return parsed
