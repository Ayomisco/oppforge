#!/usr/bin/env python3
"""
Add new real opportunities – March 20, 2026 batch.
Sources: 0G APAC Hackathon, The Synthesis, Twitter writing/video contests,
         Arbitrum Mentoring Program (Robinhood Chain).
Run: python add_march20_batch.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from app.models.opportunity import Opportunity
from app.database import SessionLocal

TODAY = datetime(2026, 3, 20, tzinfo=timezone.utc)

NEW_OPPORTUNITIES = [

    # ─────────────────────────────────────────────────────────────────────────
    # 1. 0G APAC HACKATHON
    # ─────────────────────────────────────────────────────────────────────────
    {
        "title": "0G APAC Hackathon – AI x Web3 Builder Program",
        "description": (
            "The 0G APAC Hackathon is a builder program for developers creating the next "
            "generation of AI x Web3 applications on 0G's modular infrastructure. Running "
            "March–May 2026, it invites developers, founders, and early-stage teams to build "
            "across five tracks: Agentic Infrastructure (OpenClaw Lab), Agentic Trading Arena "
            "(Verifiable Finance), Agentic Economy & Autonomous Applications, Web 4.0 Open "
            "Innovation, and Privacy & Sovereign Infrastructure. Total prize pool is $150,000 "
            "in USDT + 0G Ecosystem Credits. Grand prizes: 1st $45K, 2nd $35K, 3rd $20K, plus "
            "10 Excellence Awards ($3,700 each) and 10 Community Awards ($1,300 each). All teams "
            "must demonstrate real 0G component integration (Storage, Compute, Chain, Agent ID, "
            "or Privacy/TEE) with on-chain proof. Selected teams can present at Hong Kong Web3 "
            "Festival on April 22."
        ),
        "category": "Hackathon",
        "sub_category": "AI x Web3 / Modular Infra",
        "chain": "Multi-chain",
        "reward_pool": "$150,000 USDT + 0G Ecosystem Credits",
        "estimated_value_usd": 150000,
        "url": "https://www.hackquest.io/hackathons/0G-APAC-Hackathon",
        "source": "manual",
        "posted_at": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "start_date": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "deadline": datetime(2026, 5, 9, 23, 59, tzinfo=timezone.utc),
        "tags": [
            "AI Agents", "Web3", "0G", "APAC", "Modular Infra",
            "DeFi", "Privacy", "ZK", "Hackathon", "HackQuest"
        ],
        "difficulty": "Intermediate",
        "difficulty_score": 6,
        "required_skills": [
            "Solidity / Smart Contracts", "AI/ML or Agent Frameworks",
            "Web3 Development", "0G SDK / API Integration",
            "System Architecture", "GitHub"
        ],
        "mission_requirements": [
            "Register on HackQuest and form a team of 1–6 members",
            "Choose one of 5 tracks: Agentic Infra, Agentic Trading, Agentic Economy, Web 4.0 Open, or Privacy & Sovereign Infra",
            "Submit online checkpoint in early April with project direction, architecture, and current status",
            "Integrate at least one 0G core component: 0G Storage, Compute, Chain, Agent ID, or Privacy/TEE",
            "Provide a 0G mainnet contract address and 0G Explorer link proving on-chain activity",
            "Submit a public GitHub repo with meaningful commit history",
            "Record a ≤3-minute demo video showing core functionality and 0G integration (YouTube/Loom)",
            "Publish a public X post tagging @0G_labs @0g_CN @0g_Eco @HackQuest_ with #0GHackathon #BuildOn0G",
            "Write a project README (English or Chinese) with architecture diagram, 0G module usage, and deployment steps",
            "Complete and submit all materials via HackQuest before May 9, 2026, 23:59 UTC+8",
            "Optional bonus: pitch deck, frontend demo link, user feedback screenshots, API docs"
        ],
        "trust_score": 93,
        "is_verified": True,
    },

    # ─────────────────────────────────────────────────────────────────────────
    # 2. THE SYNTHESIS – Agentic Ethereum Hackathon
    # ─────────────────────────────────────────────────────────────────────────
    {
        "title": "The Synthesis – Agentic Ethereum Online Hackathon",
        "description": (
            "The Synthesis is a fully online hackathon where AI agents and human builders "
            "compete side-by-side, judged by both agentic judges and humans across the Ethereum "
            "ecosystem. Building started March 13 and ends ~March 22, 2026. Four themes: "
            "Agents that Pay (trustless agent-controlled spending), Agents that Trust "
            "(decentralized identity without centralized registries), Agents that Cooperate "
            "(neutral enforcement for agent-to-agent deals), and Agents that Keep Secrets "
            "(privacy-preserving agent metadata). Open Track prizes plus 30+ partner bounties "
            "from Ethereum Foundation, Base, Lido DAO, EigenLayer, OpenServ, Venice, Filecoin, "
            "Uniswap, Olas, Lit Protocol, Talent Protocol, and more. AI agents may legally "
            "enter, win, and receive prizes. Judges are themselves AI agents."
        ),
        "category": "Hackathon",
        "sub_category": "AI Agents / Ethereum",
        "chain": "Ethereum",
        "reward_pool": "Open Track + 30+ Partner Bounties",
        "estimated_value_usd": 50000,   # conservative estimate given breadth of partners
        "url": "https://synthesis.md/",
        "source": "manual",
        "posted_at": datetime(2026, 3, 13, tzinfo=timezone.utc),
        "start_date": datetime(2026, 3, 13, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 22, 23, 59, tzinfo=timezone.utc),
        "tags": [
            "AI Agents", "Ethereum", "Agentic Judging", "Privacy",
            "DeFi", "Identity", "Open Track", "Devfolio", "EigenLayer",
            "Lido", "Base", "Filecoin", "Uniswap"
        ],
        "difficulty": "Intermediate",
        "difficulty_score": 6,
        "required_skills": [
            "Ethereum / Solidity", "AI Agent Development",
            "Smart Contract Integration", "Web3 APIs",
            "Any: Rust, TypeScript, Python for agent logic"
        ],
        "mission_requirements": [
            "Register on synthesis.md (humans or AI agents may register)",
            "Build within one or more themes: Agents that Pay, Trust, Cooperate, or Keep Secrets",
            "Focus on Ethereum as the trust layer for agentic infrastructure",
            "Integrate at least one partner tool for partner-track bounties (Base, EigenLayer, Venice, Lit Protocol, etc.)",
            "AI agents: fetch the skill manifest at https://synthesis.md/skill.md and follow autonomous registration flow",
            "Submit working project before building ends (~March 22)",
            "Agentic feedback review happens during the hackathon window",
            "Winners decided after building ends via agentic + human scoring"
        ],
        "trust_score": 90,
        "is_verified": True,
    },

    # ─────────────────────────────────────────────────────────────────────────
    # 3. TWITTER WRITING / VIDEO CONTESTS BATCH
    # ─────────────────────────────────────────────────────────────────────────

    {
        "title": "Walrus Protocol Writing/Video Contest ($2,000 WAL)",
        "description": (
            "Walrus Protocol is running a writing or video content contest with $2,000 in WAL "
            "tokens as prizes. Create high-quality educational or promotional content about "
            "Walrus, a decentralized storage and data availability protocol on Sui. "
            "Deadline: April 17, 2026. Part of a broader $60K+ writing and video contest "
            "ecosystem running across Web3 projects."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Sui",
        "reward_pool": "$2,000 in WAL",
        "estimated_value_usd": 2000,
        "url": "https://x.com/i/status/2034054046022246792",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "deadline": datetime(2026, 4, 17, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "Walrus", "Sui", "Storage", "WAL"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Writing or Video Production", "Social Media"],
        "mission_requirements": [
            "Create original content (article, thread, or video) about Walrus Protocol",
            "Content must be educational or promotional — explain what Walrus does, why it matters, or show a use case",
            "Post publicly on X (Twitter) or relevant content platform",
            "Submit your entry via the official X post or form linked in the tweet",
            "Deadline: April 17, 2026",
            "Prizes paid in WAL tokens"
        ],
        "trust_score": 82,
        "is_verified": True,
    },

    {
        "title": "FliteGrid Content Contest ($2,000)",
        "description": (
            "FliteGrid is hosting a writing or video content contest with $2,000 in prizes. "
            "Create content about FliteGrid's Web3 or decentralized infrastructure offering. "
            "Deadline: March 28, 2026. Quick turnaround contest — ideal for creators who can "
            "produce quality content fast."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Multi-chain",
        "reward_pool": "$2,000",
        "estimated_value_usd": 2000,
        "url": "https://x.com/i/status/2033567522579234902",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 28, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "FliteGrid", "Campaign"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Writing or Video Production"],
        "mission_requirements": [
            "Create original content about FliteGrid (article, tweet thread, or short video)",
            "Post publicly and tag FliteGrid official account",
            "Submit via the link in the original tweet",
            "Deadline: March 28, 2026 — fast turnaround, start immediately",
            "Prize: $2,000 distributed to top creators"
        ],
        "trust_score": 78,
        "is_verified": True,
    },

    {
        "title": "HTX x APEPE Content Contest ($4,000)",
        "description": (
            "HTX exchange in collaboration with APEPE is running a writing or video content "
            "contest with $4,000 in rewards. Create content promoting the partnership or "
            "explaining APEPE's ecosystem. Deadline: March 27, 2026. Suitable for creators "
            "comfortable with meme culture, DeFi narratives, or exchange promotions."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Multi-chain",
        "reward_pool": "$4,000",
        "estimated_value_usd": 4000,
        "url": "https://x.com/i/status/2033475861542838419",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 19, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 27, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "HTX", "APEPE", "Exchange", "Meme"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Social Media", "Meme/Narrative Writing"],
        "mission_requirements": [
            "Create original content about HTX x APEPE collaboration",
            "Can be an article, tweet thread, meme, or short video",
            "Post publicly on X and tag both @HTX_Global and @APEPE official accounts",
            "Follow any hashtag requirements listed in the original tweet",
            "Submit entry via the link in the original tweet",
            "Deadline: March 27, 2026",
            "Prize: $4,000 total distributed among winners"
        ],
        "trust_score": 80,
        "is_verified": True,
    },

    {
        "title": "Sonic Global Hub Content Contest (50,000 S)",
        "description": (
            "Sonic Global Hub is running a content contest with 50,000 S (Sonic native token) "
            "in prizes for creators who produce writing or video content about the Sonic "
            "blockchain ecosystem. Sonic is an EVM-compatible L1 with high throughput. "
            "Deadline: March 25, 2026 — very urgent, only days remaining."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Sonic",
        "reward_pool": "50,000 S tokens",
        "estimated_value_usd": 5000,   # rough estimate depending on S price
        "url": "https://x.com/i/status/2034280709486170268",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 25, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "Sonic", "L1", "EVM", "Campaign"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Writing or Video Production", "Social Media"],
        "mission_requirements": [
            "URGENT: Deadline March 25 — only 5 days away, act immediately",
            "Create original content about Sonic blockchain or Sonic Global Hub",
            "Post publicly on X, tag @SonicGlobalHub or official Sonic accounts",
            "Submit entry via the link in the original tweet",
            "Prize: 50,000 S tokens split among top creators",
            "Focus on Sonic's speed, EVM compatibility, or ecosystem highlights"
        ],
        "trust_score": 80,
        "is_verified": True,
    },

    {
        "title": "ACI Content Contest ($250 in ACL tokens)",
        "description": (
            "ACI (Agent Commerce Infrastructure) is running a content campaign rewarding "
            "creators with $250 in ACL tokens for writing or video content about their "
            "protocol. ACL is the governance and utility token of the ACI ecosystem focused "
            "on agent-to-agent commerce infrastructure. Deadline: March 31, 2026."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Multi-chain",
        "reward_pool": "$250 in ACL",
        "estimated_value_usd": 250,
        "url": "https://x.com/i/status/2031056704859766896",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 15, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 31, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "ACI", "ACL", "AI Agents", "Commerce"],
        "difficulty": "Beginner",
        "difficulty_score": 1,
        "required_skills": ["Content Creation", "Writing", "Social Media"],
        "mission_requirements": [
            "Create original content about ACI (Agent Commerce Infrastructure)",
            "Content can be a written thread, article, or short video",
            "Post publicly on X and tag @ACI official account",
            "Submit via the link in the original tweet before March 31",
            "Prize: $250 in ACL tokens — smaller but quick and beginner-friendly"
        ],
        "trust_score": 75,
        "is_verified": True,
    },

    {
        "title": "CHETGPT Content Contest ($1,000)",
        "description": (
            "CHETGPT is running a writing or video content contest with $1,000 in prizes. "
            "Create content explaining, promoting, or showcasing the CHETGPT project. "
            "Deadline: March 28, 2026. Quick-win opportunity for content creators in the "
            "Web3 space."
        ),
        "category": "Campaign",
        "sub_category": "Social/Content",
        "chain": "Multi-chain",
        "reward_pool": "$1,000",
        "estimated_value_usd": 1000,
        "url": "https://x.com/i/status/2034184943635419218",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "deadline": datetime(2026, 3, 28, 23, 59, tzinfo=timezone.utc),
        "tags": ["Writing", "Video", "Content", "CHETGPT", "AI", "Campaign"],
        "difficulty": "Beginner",
        "difficulty_score": 2,
        "required_skills": ["Content Creation", "Writing or Video Production"],
        "mission_requirements": [
            "Create original content about CHETGPT (article, thread, or short video)",
            "Post publicly on X and tag @CHETGPT official account",
            "Follow any hashtag requirements in the original tweet",
            "Submit entry via form or link in the original tweet",
            "Deadline: March 28, 2026",
            "Prize: $1,000 distributed to best entries"
        ],
        "trust_score": 76,
        "is_verified": True,
    },

    # ─────────────────────────────────────────────────────────────────────────
    # 4. ARBITRUM MENTORING PROGRAM – ROBINHOOD CHAIN
    # ─────────────────────────────────────────────────────────────────────────
    {
        "title": "Arbitrum x Robinhood Chain Mentoring Program ($100K Demo Day)",
        "description": (
            "Arbitrum is supporting early-stage builders bringing new financial products to "
            "life on the Robinhood Chain — an Arbitrum-based L2 designed for regulated "
            "on-chain finance. With $100K in rewards up for grabs at Demo Day, the program "
            "provides mentorship, technical support, and go-to-market amplification for teams "
            "building core primitives: on-chain brokerage integrations, tokenized securities, "
            "DeFi-native financial instruments, compliant stablecoin rails, and novel retail "
            "financial products that leverage Robinhood's user base and regulatory posture. "
            "Ideal for early-stage fintech × crypto teams with a working prototype or clear MVP."
        ),
        "category": "Accelerator",
        "sub_category": "DeFi / Fintech",
        "chain": "Arbitrum",
        "reward_pool": "$100,000 (Demo Day)",
        "estimated_value_usd": 100000,
        "url": "https://tally.so/r/aQdj2W",
        "source": "twitter",
        "posted_at": datetime(2026, 3, 20, tzinfo=timezone.utc),
        "deadline": None,   # Apply today — rolling until cohort fills
        "tags": [
            "Arbitrum", "Robinhood", "DeFi", "Fintech", "Tokenized Securities",
            "Mentoring", "Demo Day", "L2", "Accelerator", "On-Chain Finance"
        ],
        "difficulty": "Advanced",
        "difficulty_score": 7,
        "required_skills": [
            "Solidity / Arbitrum SDK", "DeFi Protocol Design",
            "Financial Product Development", "Business / GTM",
            "Regulatory Awareness (helpful)"
        ],
        "mission_requirements": [
            "Apply via the Tally form at https://tally.so/r/aQdj2W",
            "Build a financial product on Robinhood Chain (Arbitrum L2)",
            "Focus on one of Robinhood Chain's core primitives: on-chain brokerage, tokenized assets, compliant stablecoins, or DeFi instruments for retail",
            "Team must be early-stage but have a working concept, prototype, or MVP",
            "Participate in the mentoring program with Arbitrum ecosystem support",
            "Pitch at Demo Day for a share of $100,000 in rewards",
            "Leverage Robinhood's user base and regulated infrastructure as your distribution moat"
        ],
        "trust_score": 92,
        "is_verified": True,
    },
]


def main():
    db = SessionLocal()
    added = 0
    skipped = 0

    for opp_data in NEW_OPPORTUNITIES:
        existing = db.query(Opportunity).filter(
            Opportunity.title == opp_data["title"]
        ).first()

        if existing:
            print(f"  ⏭  Already exists: {opp_data['title'][:60]}")
            skipped += 1
            continue

        slug = (
            opp_data["title"]
            .lower()
            .replace(" ", "-")
            .replace("&", "and")
            .replace("(", "")
            .replace(")", "")
            .replace("$", "")
            .replace(",", "")[:60]
        )

        opp = Opportunity(
            title=opp_data["title"],
            slug=slug,
            description=opp_data.get("description", ""),
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
        print(f"  ✅ Added: {opp_data['title'][:60]}")

    db.commit()
    db.close()
    print(f"\n✨ Done: {added} added, {skipped} skipped (duplicates)")


if __name__ == "__main__":
    main()
