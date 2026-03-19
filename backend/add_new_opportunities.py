#!/usr/bin/env python3
"""
Add new real opportunities from social media posts (March 2026)
Run this script to inject the latest opportunities into the database.
"""
from datetime import datetime, timezone, timedelta
from app.models.opportunity import Opportunity
from app.database import SessionLocal
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Current date reference: March 19, 2026
TODAY = datetime(2026, 3, 19, tzinfo=timezone.utc)

NEW_OPPORTUNITIES = [
    {
        "title": "Perle Labs Content Creator Campaign",
        "description": "Create content about Perle Labs on X to win USDC. Top creators earn $350-$50 depending on content quality, originality, and engagement.",
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Multi-chain",
        "reward_pool": "$55,000 USDC",
        "estimated_value_usd": 55000,
        "url": "https://forms.gle/59CDQHKB6AAm5RmN6",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 27, 23, 59, tzinfo=timezone.utc),
        "tags": ["Social", "Content Creation", "X", "Community"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Social Media"],
        "mission_requirements": [
            "Create original content about Perle Labs",
            "Post on X with hashtags #PerleAI #ToPerle",
            "Include text: '— participating in @PerleLabs community campaign'",
            "Submit via form before March 27 23:59 UTC",
            "Max 3 submissions per person"
        ],
        "trust_score": 85,
        "is_verified": True,
    },
    {
        "title": "HeyElsa Agentic Fellowship",
        "description": "$1M funding for builders creating revenue-generating AI agents on-chain. Fellowship provides direct funding, technical support (x402 APIs, ERC-8004), mentorship, and GTM amplification.",
        "category": "Grant",
        "sub_category": "AI Agents",
        "chain": "Multi-chain",
        "reward_pool": "$1,000,000",
        "estimated_value_usd": 1000000,
        "url": "https://tally.so/r/PdEG21",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": None,  # Rolling
        "tags": ["AI Agents", "DeFi", "On-Chain Execution", "Funding"],
        "difficulty": "Advanced",
        "difficulty_score": 8,
        "required_skills": ["Solidity", "AI/ML", "DeFi Knowledge", "Business"],
        "mission_requirements": [
            "Build revenue-generating on-chain agents using x402, ERC-8004, or Elsa LLM Gateway",
            "Demonstrate real on-chain execution capability",
            "Agent must be designed for monetization from day one",
            "Project must be composable within the agentic economy",
            "Milestone-based funding disbursement"
        ],
        "trust_score": 95,
        "is_verified": True,
    },
    {
        "title": "MagicBlock Solana Blitz v2 Hackathon",
        "description": "48-hour hackathon focused on privacy apps using Solana's Private Ephemeral Rollups (PER). Build sealed auctions, private payments, private credentials, or hidden game state.",
        "category": "Hackathon",
        "sub_category": "Privacy/ZK",
        "chain": "Solana",
        "reward_pool": "$1,500 USDC",
        "estimated_value_usd": 1500,
        "url": "http://hackathon.magicblock.app",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 22, tzinfo=timezone.utc),
        "start_date": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "tags": ["Hackathon", "Privacy", "Solana", "Zero Knowledge"],
        "difficulty": "Intermediate",
        "difficulty_score": 6,
        "required_skills": ["Rust", "Solana", "Smart Contracts"],
        "mission_requirements": [
            "Build privacy app using Ephemeral Rollups or Private ERs",
            "Submit by Sunday March 22",
            "Can be solo or team",
            "Include demo and source code"
        ],
        "trust_score": 90,
        "is_verified": True,
    },
    {
        "title": "Mandala Ambassador Program",
        "description": "Join Mandala's ambassador program to create content, engage communities on Telegram/Discord, host events, and partnerships. Earn stable coins for contributions.",
        "category": "Ambassador",
        "sub_category": "Community",
        "chain": "Multi-chain",
        "url": "https://forms.gle/eBztNjK5zJ3KkNCM7",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": None,  # Rolling
        "tags": ["Ambassador", "Community", "Content", "Telegram", "Discord"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Community Management"],
        "mission_requirements": [
            "Create content (threads, memes, stories, articles)",
            "Engage communities on Telegram & Discord",
            "Host events, chats, or partnerships",
            "Apply via Google Form",
            "Standard compensation in stablecoins"
        ],
        "trust_score": 88,
        "is_verified": True,
    },
    {
        "title": "Alliance ALL17 Acceleration Program",
        "description": "$500K funding, 2-week in-person onboarding, 8-week remote program, and Demo Day with Paradigm, a16z, Founders Fund, and Dragonfly. Join 300+ Alliance startups.",
        "category": "Accelerator",
        "sub_category": "Funding",
        "chain": "Multi-chain",
        "reward_pool": "$500,000",
        "estimated_value_usd": 500000,
        "url": "https://t.co/4rDXZ2sdVX",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 25, tzinfo=timezone.utc),
        "tags": ["Accelerator", "Funding", "Startup", "Web3"],
        "difficulty": "Advanced",
        "difficulty_score": 8,
        "required_skills": ["Business", "Product", "Team Leadership"],
        "mission_requirements": [
            "Early-stage startup preparing to launch or recently launched",
            "Apply by March 25",
            "Commit to 10-week program (2-week in-person + 8-week remote)",
            "Available for weekly mentorship and demo day pitch",
            "Team-based application"
        ],
        "trust_score": 98,
        "is_verified": True,
    },
    {
        "title": "ElevenHacks Hackathon Series",
        "description": "11 consecutive hackathons with $240K+ combined prize pool. Different sponsor each week, but points carry across global leaderboard. Mystery grand prize for top leaderboard finisher.",
        "category": "Hackathon",
        "sub_category": "Multi-Sponsor",
        "chain": "Multi-chain",
        "reward_pool": "$240,000+",
        "estimated_value_usd": 240000,
        "url": "https://t.co/yPqTgisPUs",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "deadline": None,  # Series runs across weeks
        "start_date": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "tags": ["Hackathon", "Stripe", "Cloudflare", "Cursor", "Replit"],
        "difficulty": "Intermediate",
        "difficulty_score": 5,
        "required_skills": ["Full Stack", "Problem Solving"],
        "mission_requirements": [
            "Participate in any ElevenHacks challenge",
            "First challenge: Firecrawl (~$20K prize pool)",
            "Points carry across all 11 hackathons",
            "Global leaderboard tracking",
            "Submit working project with demo"
        ],
        "trust_score": 92,
        "is_verified": True,
    },
    {
        "title": "TinyFish Accelerator - Agentic Apps",
        "description": "9-week accelerator for founders building agents that navigate real web interfaces and execute real transactions. $2M seed pool. Get free API keys, engineering support, mentorship from VCs.",
        "category": "Accelerator",
        "sub_category": "AI Agents",
        "chain": "Multi-chain",
        "reward_pool": "$2,000,000",
        "estimated_value_usd": 2000000,
        "url": "http://tinyfish.ai/accelerator",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 31, tzinfo=timezone.utc),
        "tags": ["Accelerator", "AI Agents", "Web Interface", "Automation", "Funding"],
        "difficulty": "Advanced",
        "difficulty_score": 8,
        "required_skills": ["AI/ML", "Full Stack", "API Integration"],
        "mission_requirements": [
            "Build working agentic app that navigates web interfaces",
            "Agent must execute real transactions",
            "Record demo video and publish on X",
            "Applications due end of March",
            "Selected founders get mentorship from Robin Vasan (Mango Capital)"
        ],
        "trust_score": 94,
        "is_verified": True,
    },
    {
        "title": "a16z Crypto Startup Accelerator (CSX)",
        "description": "Well-known web3 accelerator backed by Andreessen Horowitz. Funding (up to $500K), 10-week program on product-market fit, token design, GTM. 1:1 mentorship, powerful network access.",
        "category": "Accelerator",
        "sub_category": "Funding",
        "chain": "Multi-chain",
        "reward_pool": "Up to $500,000",
        "estimated_value_usd": 500000,
        "url": "https://a16zcrypto.com",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": None,  # Rolling
        "tags": ["Accelerator", "a16z", "Crypto", "Funding", "Web3"],
        "difficulty": "Advanced",
        "difficulty_score": 8,
        "required_skills": ["Business", "Product", "Blockchain"],
        "mission_requirements": [
            "Early-stage Web3 startup",
            "Apply on rolling basis",
            "10-week program with top investor/operator mentorship",
            "Pitch to top-tier investors at demo day",
            "Network access to 300+ VCs and founders"
        ],
        "trust_score": 99,
        "is_verified": True,
    },
    {
        "title": "2048vc Pre-Seed Fast Track",
        "description": "Get funded within 10 business days. For founders building Vertical AI, Deep Tech, Health, or Bio startups seeking $500K-$1.5M pre-seed. Fast, transparent process.",
        "category": "Grant",
        "sub_category": "Pre-Seed Funding",
        "chain": "Multi-chain",
        "reward_pool": "$500,000 - $1,500,000",
        "estimated_value_usd": 1000000,
        "url": "http://2048.vc/fasttrack",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": None,  # Rolling
        "tags": ["Vertical AI", "Deep Tech", "Health", "Bio", "Pre-Seed"],
        "difficulty": "Advanced",
        "difficulty_score": 7,
        "required_skills": ["Business", "AI/ML or Science"],
        "mission_requirements": [
            "Building Vertical AI, Deep Tech, Health, or Bio startup",
            "Seeking $500K-$1.5M pre-seed",
            "Submit via application",
            "Fast-track: funding within 10 business days",
            "Transparent, no-BS process"
        ],
        "trust_score": 80,
        "is_verified": True,
    },
    {
        "title": "dev3pack Global Hackathon",
        "description": "Global hackathon with 1,000+ students from 30+ local hubs worldwide launching end of May. Includes vibe-coding bootcamp prep and friendly startup 101 accelerator for young founders.",
        "category": "Hackathon",
        "sub_category": "Education/Startup",
        "chain": "Multi-chain",
        "url": "https://hack.dev3pack.xyz",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 5, 31, tzinfo=timezone.utc),
        "start_date": datetime(2026, 5, 1, tzinfo=timezone.utc),
        "tags": ["Hackathon", "Education", "Global", "Students", "Startup"],
        "difficulty": "Beginner",
        "difficulty_score": 3,
        "required_skills": ["Any"],
        "mission_requirements": [
            "Attend vibe-coding bootcamp",
            "Participate in global hackathon (May)",
            "Engage with 1,000+ students from 30+ hubs",
            "Optional: apply for startup 101 accelerator",
            "Focus on developer relations and grassroots community"
        ],
        "trust_score": 85,
        "is_verified": True,
    },
    {
        "title": "Atrium Academy (UHI) - DeFi Building",
        "description": "500+ graduates, $235K+ in prizes awarded. Where DeFi builders go to ship. Apps close March 29. Tuition 100% covered by Uniswap Foundation.",
        "category": "Accelerator",
        "sub_category": "DeFi Building",
        "chain": "Ethereum",
        "reward_pool": "$235,000+",
        "estimated_value_usd": 235000,
        "url": "https://t.co/6cPiUvNCuJ",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 29, tzinfo=timezone.utc),
        "tags": ["DeFi", "Building", "Education", "Uniswap", "Shipping"],
        "difficulty": "Intermediate",
        "difficulty_score": 5,
        "required_skills": ["Solidity", "DeFi", "Smart Contracts"],
        "mission_requirements": [
            "Apply by March 29",
            "Focus on DeFi building and shipping",
            "100% tuition covered by Uniswap Foundation",
            "Access to 500+ graduate network",
            "Mentorship and ecosystem support"
        ],
        "trust_score": 92,
        "is_verified": True,
    },
    {
        "title": "Photon Ambassador Program",
        "description": "$100K available. Build agents that normal people can actually use. Get X Premium+, official Photon affiliate status, unlimited SDK access, and performance-based bonuses.",
        "category": "Ambassador",
        "sub_category": "AI Agents",
        "chain": "Multi-chain",
        "reward_pool": "$100,000",
        "estimated_value_usd": 100000,
        "url": "https://photonhq.typeform.com/to/KKiVcjyE",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": None,  # Rolling
        "tags": ["AI Agents", "Ambassador", "Developer", "SDK"],
        "difficulty": "Intermediate",
        "difficulty_score": 5,
        "required_skills": ["AI/ML", "Full Stack", "Developer"],
        "mission_requirements": [
            "Build agent applications using Photon SDK",
            "Agents must be usable by normal people",
            "Apply via typeform",
            "Get X Premium+ and affiliate status",
            "Performance-based bonus compensation"
        ],
        "trust_score": 88,
        "is_verified": True,
    },
    {
        "title": "AEON Pioneer Program",
        "description": "March Ambassador Program for passionate builders. Create content, engage community, build the future with AEON. Direct integration with Zealy for tracking contributions.",
        "category": "Ambassador",
        "sub_category": "Community",
        "chain": "Multi-chain",
        "url": "https://zealy.io/cw/aeonpioneer",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 18, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 31, tzinfo=timezone.utc),
        "tags": ["Ambassador", "AI Payment", "Pioneer", "Web3", "Community"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Community"],
        "mission_requirements": [
            "Join Zealy community",
            "Create content about AEON",
            "Engage with community",
            "Track contributions on Zealy",
            "Passionate about AI Payment vision"
        ],
        "trust_score": 82,
        "is_verified": True,
    },
]


def main():
    db = SessionLocal()
    added = 0
    skipped = 0

    for opp_data in NEW_OPPORTUNITIES:
        # Check if already exists
        existing = db.query(Opportunity).filter(
            Opportunity.title == opp_data["title"]
        ).first()

        if existing:
            print(f"  ⏭ Already exists: {opp_data['title'][:50]}")
            skipped += 1
            continue

        # Create slug from title
        slug = opp_data["title"].lower().replace(" ", "-").replace("&", "and")[:50]
        opp = Opportunity(
            title=opp_data["title"],
            slug=slug,
            description=opp_data["description"],
            category=opp_data.get("category"),
            sub_category=opp_data.get("sub_category"),
            chain=opp_data.get("chain", "Multi-chain"),
            reward_pool=opp_data.get("reward_pool"),
            estimated_value_usd=opp_data.get("estimated_value_usd"),
            url=opp_data["url"],
            source=opp_data.get("source", "twitter"),
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
        print(f"  ✅ Added: {opp_data['title'][:50]}")

    db.commit()
    db.close()
    print(f"\n✨ Done: {added} added, {skipped} skipped (duplicates)")


if __name__ == "__main__":
    main()
