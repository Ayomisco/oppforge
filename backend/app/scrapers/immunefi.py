from datetime import datetime
from typing import List, Dict, Any
from .base import BaseScraper

class ImmunefiScraper(BaseScraper):
    def __init__(self):
        super().__init__("Immunefi")
        
    def fetch(self) -> List[Dict[str, Any]]:
        return []

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return []
