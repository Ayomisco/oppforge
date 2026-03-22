#!/usr/bin/env python3
"""
Add Purch Vault Hackathon – $5,000 USDC across 4 categories.
Run: python add_purch_vault.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from app.models.opportunity import Opportunity
from app.database import SessionLocal

NEW_OPPORTUNITIES = [
    {
        "title": "Purch Vault Hackathon ($5,000 USDC)",
        "description": (
            "Purch Vault Hackathon is a builder competition with $5,000 USDC in prizes across "
            "4 categories: Best Purch Integration, Best Skill, Best Knowledge Pack, and Best Persona. "
            "Build with Purch's infrastructure — a platform enabling agents, apps, and protocols to "
            "create programmable commerce vaults. Whether you're integrating Purch into an existing "
            "product, creating reusable skills, packaging knowledge, or designing personas, there's "
            "a category for every builder. Deadline: April 20, 2026."
        ),
        "category": "Hackathon",
        "sub_category": "Commerce / Agent Infrastructure",
        "chain": "Multi-chain",
        "reward_pool": "$5,000 USDC",
        "estimated_value_usd": 5000,
        "url": "http://purch.xyz/hackathon",
        "source": "manual",
        "posted_at": datetime(2026, 3, 22, tzinfo=timezone.utc),
        "start_date": datetime(2026, 3, 22, tzinfo=timezone.utc),
        "deadline": datetime(2026, 4, 20, 23, 59, tzinfo=timezone.utc),
        "tags": [
            "Build", "Demo", "Integration", "Purch", "Vault", "Hackathon",
            "Agents", "Commerce", "USDC", "Skills", "Persona"
        ],
        "difficulty": "Intermediate",
        "difficulty_score": 5,
        "required_skills": [
            "Web3 Development",
            "Smart Contract Integration",
            "API Integration",
            "Agent / AI Development (optional)",
        ],
        "mission_requirements": [
            "Register at http://purch.xyz/hackathon",
            "Choose one of 4 prize categories: Best Purch Integration, Best Skill, Best Knowledge Pack, or Best Persona",
            "Best Purch Integration: Build a product or feature that integrates the Purch Vault protocol",
            "Best Skill: Create a reusable, composable skill module on top of Purch",
            "Best Knowledge Pack: Package structured knowledge usable within Purch vaults",
            "Best Persona: Design a compelling agent persona powered by Purch infrastructure",
            "Submit a working demo before April 20, 2026",
            "Include a public GitHub repo with your project",
            "Prizes: $5,000 USDC split across category winners",
        ],
        "trust_score": 85,
        "is_verified": True,
    },
]


def make_slug(title: str) -> str:
    import re
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug.strip())
    return slug[:80]


def main():
    db = SessionLocal()
    added = 0
    skipped = 0

    for opp_data in NEW_OPPORTUNITIES:
        existing = db.query(Opportunity).filter(
            Opportunity.title == opp_data["title"]
        ).first()

        if existing:
            print(f"  Already exists: {opp_data['title'][:60]}")
            skipped += 1
            continue

        opp = Opportunity(
            title=opp_data["title"],
            slug=make_slug(opp_data["title"]),
            description=opp_data.get("description", ""),
            category=opp_data.get("category"),
            sub_category=opp_data.get("sub_category"),
            chain=opp_data.get("chain", "Multi-chain"),
            reward_pool=opp_data.get("reward_pool"),
            estimated_value_usd=opp_data.get("estimated_value_usd"),
            url=opp_data["url"],
            source=opp_data.get("source", "manual"),
            posted_at=opp_data.get("posted_at"),
            deadline=opp_data.get("deadline"),
            start_date=opp_data.get("start_date"),
            tags=opp_data.get("tags", []),
            difficulty=opp_data.get("difficulty"),
            difficulty_score=opp_data.get("difficulty_score", 5),
            required_skills=opp_data.get("required_skills", []),
            mission_requirements=opp_data.get("mission_requirements", []),
            trust_score=opp_data.get("trust_score", 75),
            is_verified=opp_data.get("is_verified", False),
        )
        db.add(opp)
        added += 1
        print(f"  Added: {opp_data['title'][:60]}")

    db.commit()
    db.close()
    print(f"\nDone: {added} added, {skipped} skipped")


if __name__ == "__main__":
    main()
