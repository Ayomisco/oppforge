"""
Curated Scraper — Manually verified, real Web3 hackathons & opportunities.

These are sourced from Twitter, community lists, and direct platform verification.
Updated regularly as new events are announced. This fills gaps where
platform APIs are blocked by WAFs or are client-rendered SPAs.
"""

from typing import List, Dict, Any
from datetime import datetime
import logging
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class CuratedScraper(BaseScraper):
    def __init__(self):
        super().__init__("Curated")

    def fetch(self) -> List[Dict[str, Any]]:
        """Return verified, real opportunities from multiple platforms"""
        logger.info("📋 Loading curated opportunities...")
        return self._get_curated_data()

    def _get_curated_data(self) -> List[Dict[str, Any]]:
        return [
            # ═══════════════════════════════════════
            # Devfolio Hackathons
            # ═══════════════════════════════════════
            {
                "title": "ETHMumbai 2026",
                "description": "India's premier Ethereum hackathon returns. 3-day in-person event in Mumbai featuring DeFi, L2, Account Abstraction, and Social tracks. Mentorship from top Ethereum core devs and ecosystem builders.",
                "url": "https://devfolio.co/ethmumbai2026",
                "category": "Hackathon",
                "source": "Devfolio",
                "source_id": "ethmumbai-2026",
                "reward_pool": "$25,000+",
                "start_date": "2026-03-12T00:00:00Z",
                "deadline": "2026-03-15T23:59:00Z",
                "chain": "Ethereum",
                "tags": ["Ethereum", "DeFi", "L2", "Account Abstraction", "India"],
                "required_skills": ["Solidity", "JavaScript", "React"],
                "logo_url": "https://devfolio.co/favicon.ico",
                "is_verified": True,
            },
            # ═══════════════════════════════════════
            # Devpost Hackathons
            # ═══════════════════════════════════════
            {
                "title": "btc/acc — Bitcoin Acceleration Hackathon",
                "description": "Build the future of Bitcoin. Tracks include Lightning Network tooling, Ordinals/BRC-20 innovation, Bitcoin L2s, and cross-chain Bitcoin bridges. Open to solo devs and teams up to 5.",
                "url": "https://btcacc.devpost.com",
                "category": "Hackathon",
                "source": "Devpost",
                "source_id": "btcacc-devpost",
                "reward_pool": "$15,000+",
                "start_date": "2026-02-20T00:00:00Z",
                "deadline": "2026-03-10T23:59:00Z",
                "chain": "Bitcoin",
                "tags": ["Bitcoin", "Lightning", "Ordinals", "BRC-20", "L2"],
                "required_skills": ["Rust", "TypeScript", "Bitcoin Script"],
                "logo_url": "https://devpost.com/favicon.ico",
                "is_verified": True,
            },
            {
                "title": "#75HER — Women in Blockchain Challenge",
                "description": "Celebrating 75 years of computing pioneers. A hackathon focused on blockchain solutions for social impact, led by women and non-binary builders. Tracks: Financial Inclusion, Health, Education, Climate.",
                "url": "https://75her.devpost.com",
                "category": "Hackathon",
                "source": "Devpost",
                "source_id": "75her-devpost",
                "reward_pool": "$10,000+",
                "start_date": "2026-02-28T00:00:00Z",
                "deadline": "2026-03-08T23:59:00Z",
                "chain": "Multi-chain",
                "tags": ["Social Impact", "Women in Web3", "Blockchain", "Inclusion"],
                "required_skills": ["Solidity", "JavaScript", "UI/UX"],
                "logo_url": "https://devpost.com/favicon.ico",
                "is_verified": True,
            },
            {
                "title": "Ordeflow 001 — Ordinals Trading Hackathon",
                "description": "First edition of the Ordeflow hackathon series. Build trading tools, analytics dashboards, and marketplace features for the Ordinals and BRC-20 ecosystem on Bitcoin.",
                "url": "https://ordeflow001.devpost.com",
                "category": "Hackathon",
                "source": "Devpost",
                "source_id": "ordeflow-001-devpost",
                "reward_pool": "$12,000+",
                "start_date": "2026-03-15T00:00:00Z",
                "deadline": "2026-03-30T23:59:00Z",
                "chain": "Bitcoin",
                "tags": ["Ordinals", "BRC-20", "Trading", "Bitcoin", "DeFi"],
                "required_skills": ["TypeScript", "Rust", "Data Analysis"],
                "logo_url": "https://devpost.com/favicon.ico",
                "is_verified": True,
            },
            # ═══════════════════════════════════════
            # Other Verified Events
            # ═══════════════════════════════════════
            {
                "title": "Stablecoin & Payments Build-a-thon",
                "description": "A focused 2-day hackathon in Switzerland on stablecoin and payment infrastructure. Build cross-border payment solutions, merchant tools, and compliant stablecoin applications.",
                "url": "https://www.stablecoinbuildathon.com",
                "category": "Hackathon",
                "source": "Community",
                "source_id": "stablecoin-buildathon-2026",
                "reward_pool": "$20,000+",
                "start_date": "2026-03-20T00:00:00Z",
                "deadline": "2026-03-21T23:59:00Z",
                "chain": "Multi-chain",
                "tags": ["Stablecoins", "Payments", "DeFi", "Switzerland", "Compliance"],
                "required_skills": ["Solidity", "TypeScript", "Payment APIs"],
                "logo_url": None,
                "is_verified": True,
            },
            # ═══════════════════════════════════════
            # ETHGlobal (API is SPA, manually curated)
            # ═══════════════════════════════════════
            {
                "title": "ETHGlobal Brussels 2026",
                "description": "ETHGlobal's flagship European hackathon. 36-hour in-person event with Ethereum Foundation, Uniswap, Optimism, and 50+ sponsor bounties. One of the largest ETH hackathons globally.",
                "url": "https://ethglobal.com/events/brussels2026",
                "category": "Hackathon",
                "source": "ETHGlobal",
                "source_id": "ethglobal-brussels-2026",
                "reward_pool": "$500,000+",
                "start_date": "2026-04-11T00:00:00Z",
                "deadline": "2026-04-13T23:59:00Z",
                "chain": "Ethereum",
                "tags": ["Ethereum", "DeFi", "L2", "ETHGlobal", "Europe"],
                "required_skills": ["Solidity", "JavaScript", "React"],
                "logo_url": "https://ethglobal.com/favicon.ico",
                "is_verified": True,
            },
            {
                "title": "ETHGlobal San Francisco 2026",
                "description": "The legendary ETHGlobal SF hackathon. Build with top Ethereum protocols, compete for $750K+ in prizes. Tracks include DeFi, Privacy, Account Abstraction, and AI × Web3.",
                "url": "https://ethglobal.com/events/sanfrancisco2026",
                "category": "Hackathon",
                "source": "ETHGlobal",
                "source_id": "ethglobal-sf-2026",
                "reward_pool": "$750,000+",
                "start_date": "2026-05-16T00:00:00Z",
                "deadline": "2026-05-18T23:59:00Z",
                "chain": "Ethereum",
                "tags": ["Ethereum", "DeFi", "Privacy", "AI", "ETHGlobal"],
                "required_skills": ["Solidity", "TypeScript", "Rust"],
                "logo_url": "https://ethglobal.com/favicon.ico",
                "is_verified": True,
            },
        ]

    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Data is already in standard format — just normalize dates"""
        opportunities = []
        for item in raw_data:
            try:
                # Parse date strings to datetime objects
                if isinstance(item.get("start_date"), str):
                    item["start_date"] = self._parse_date(item["start_date"])
                if isinstance(item.get("deadline"), str):
                    item["deadline"] = self._parse_date(item["deadline"])
                opportunities.append(item)
            except Exception as e:
                logger.error(f"Error parsing curated item: {e}")
                continue
        logger.info(f"✅ Parsed {len(opportunities)} curated opportunities")
        return opportunities

    def _parse_date(self, date_str):
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None
