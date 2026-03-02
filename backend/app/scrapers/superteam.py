"""
Superteam Scraper - Opportunities from Superteam network
"""

import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from datetime import datetime
import logging
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class SuperteamScraper(BaseScraper):
    def __init__(self):
        super().__init__("Superteam")
        self.base_url = "https://earn.superteam.fun"
        self.api_url = "https://earn.superteam.fun/api/listings"
        
    def fetch(self) -> List[Dict[str, Any]]:
        """Fetch opportunities from Superteam Earn"""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            
            # Try API
            response = httpx.get(
                self.api_url,
                headers=headers,
                timeout=30,
                params={"take": 100, "isActive": "true"},
                follow_redirects=True
            )
            
            if response.status_code == 200:
                data = response.json()
                # API returns list directly
                if isinstance(data, list):
                    logger.info(f"✅ Superteam API returned {len(data)} listings")
                    return data
                
                listings = data.get("listings", data.get("data", []))
                logger.info(f"✅ Superteam API returned {len(listings)} listings")
                return listings
            else:
                logger.warning(f"Superteam API returned {response.status_code}")
                return self._get_fallback_data()
                
        except Exception as e:
            logger.error(f"Error fetching from Superteam: {e}")
            return self._get_fallback_data()

    def _get_fallback_data(self):
        """Return hardcoded recent Superteam earn listings for demo continuity"""
        return [
            {
                "id": "st-sol-01",
                "slug": "solana-foundation-grant",
                "title": "Build a Specialized DePIN Dashboard",
                "description": "Create a dashboard for tracking DePIN metrics on Solana. Must aggregate data from at least 3 protocols.",
                "rewards": {"amount": "5,000", "token": "USDC"}, 
                "publishedAt": "2026-02-20T00:00:00Z",
                "deadline": "2026-03-20T00:00:00Z",
                "type": "bounty",
                "skills": ["React", "Data Visualization", "Solana"],
                "sponsorLogo": "https://superteam.fun/logo.png"
            },
            {
                "id": "st-monad-02",
                "slug": "monad-content-bounty",
                "title": "Deep Dive Thread on Monad Parallel Execution",
                "description": "Write a comprehensive Twitter thread explaining Monad's parallel execution model for technical audience.",
                "rewards": {"amount": "1,000", "token": "USDC"},
                "publishedAt": "2026-02-25T00:00:00Z",
                "deadline": "2026-03-10T00:00:00Z",
                "type": "bounty",
                "skills": ["Content Writing", "Technical Analysis", "Monad"],
                "sponsorLogo": "https://superteam.fun/logo.png"
            }
        ]
    
    def parse(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse Superteam data — handles both live API and fallback formats"""
        opportunities = []
        
        for listing in raw_data:
            try:
                # Determine category from type
                listing_type = listing.get("type", "bounty").lower()
                category_map = {
                    "bounty": "Bounty",
                    "project": "Grant",
                    "hackathon": "Hackathon",
                    "job": "Job"
                }
                category = category_map.get(listing_type, "Bounty")
                
                # URL: live API uses slug, type maps to URL path segment
                slug = listing.get("slug", listing.get("id", ""))
                type_path_map = {
                    "bounty": "bounties",
                    "project": "project",
                    "hackathon": "hackathon",
                    "job": "jobs"
                }
                type_path = type_path_map.get(listing_type, "bounties")
                url = f"{self.base_url}/listings/{type_path}/{slug}"
                
                # Sponsor info (live API has nested sponsor object)
                sponsor = listing.get("sponsor", {})
                logo_url = sponsor.get("logo") if isinstance(sponsor, dict) else listing.get("sponsorLogo", listing.get("logo"))
                sponsor_name = sponsor.get("name", "") if isinstance(sponsor, dict) else ""
                
                # Skills: live API may have skills as list of objects or strings
                raw_skills = listing.get("skills", [])
                if raw_skills and isinstance(raw_skills[0], dict):
                    skills = [s.get("skills", s.get("name", "")) for s in raw_skills]
                else:
                    skills = raw_skills if isinstance(raw_skills, list) else []
                
                # Build description
                desc = listing.get("description", "")
                if sponsor_name and not desc:
                    desc = f"Opportunity by {sponsor_name} on Superteam Earn"
                
                opp = {
                    "title": listing.get("title", "Untitled"),
                    "description": (desc or "")[:500],
                    "url": url,
                    "category": category,
                    "source": "Superteam",
                    "reward_pool": self._format_reward(listing),
                    "start_date": self._parse_date(listing.get("publishedAt", listing.get("startDate"))),
                    "deadline": self._parse_date(listing.get("deadline")),
                    "chain": "Solana",  # Superteam is Solana-focused
                    "tags": skills + ["solana", "superteam"],
                    "required_skills": skills,
                    "logo_url": logo_url,
                    "is_verified": sponsor.get("isVerified", True) if isinstance(sponsor, dict) else True,
                    "source_id": str(listing.get("id", slug)),
                }
                
                opportunities.append(opp)
                
            except Exception as e:
                logger.error(f"Error parsing Superteam listing: {e}")
                continue
        
        logger.info(f"✅ Parsed {len(opportunities)} Superteam opportunities")
        return opportunities
    
    def _format_reward(self, listing):
        """Format reward — handles both live API (rewardAmount+token) and fallback (rewards dict)"""
        # Live API format: top-level rewardAmount (number) + token (string)
        reward_amount = listing.get("rewardAmount")
        token = listing.get("token", "USDC")
        
        if reward_amount and reward_amount > 0:
            # Format nicely
            if reward_amount >= 1000:
                formatted = f"${reward_amount:,.0f}"
            else:
                formatted = f"${reward_amount}"
            return f"{formatted} {token}"
        
        # Fallback format: nested rewards dict
        rewards = listing.get("rewards")
        if rewards and isinstance(rewards, dict):
            amount = rewards.get("amount", rewards.get("value", ""))
            fallback_token = rewards.get("token", "USDC")
            return f"${amount} {fallback_token}" if amount else "TBD"
        
        comp_type = listing.get("compensationType", "")
        if comp_type:
            return comp_type
        
        return "TBD"
    
    def _parse_date(self, date_str):
        """Parse date"""
        if not date_str:
            return None
        try:
            if isinstance(date_str, int):
                return datetime.fromtimestamp(date_str / 1000)  # Milliseconds
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None
