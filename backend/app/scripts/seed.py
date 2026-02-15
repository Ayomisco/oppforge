"""
OppForge Database Seed Script
Populates the database with realistic test data matching the frontend mockups.
Run: cd backend && venv/bin/python app/scripts/seed.py
"""
import sys
import os

# Ensure 'app' package is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine, Base
from app.models.opportunity import Opportunity
from app.models.user import User
from app.models.tracking import TrackedApplication
from app.models.enums import UserRole
from datetime import datetime, timedelta

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ─── 1. Admin User ───
    if not db.query(User).filter(User.email == "admin@oppforge.xyz").first():
        db.add(User(
            email="admin@oppforge.xyz",
            full_name="OppForge Admin",
            role=UserRole.ADMIN,
            tier="founder", is_pro=True, xp=99999
        ))
        print("  ✓ Admin user created")

    # ─── 2. Demo User (John Doe from sidebar) ───
    demo = db.query(User).filter(User.email == "john@oppforge.xyz").first()
    if not demo:
        demo = User(
            email="john@oppforge.xyz",
            full_name="John Doe",
            tier="hunter", is_pro=True,
            skills=["Rust", "Solidity", "React", "TypeScript", "Python"],
            preferred_chains=["Solana", "Ethereum", "Arbitrum", "Base"],
            xp=2400, level=5, rank_title="Alpha Hunter"
        )
        db.add(demo)
        db.flush()
        print("  ✓ Demo user created")

    # ─── 3. Opportunities (matching screenshots exactly) ───
    opps_data = [
        {
            "title": "Solana Foundation Renaissance Hackathon",
            "category": "Hackathon", "chain": "Solana",
            "reward_pool": "$1,000,000+", "source": "Twitter",
            "url": "https://colosseum.org/renaissance",
            "description": "The Renaissance Hackathon is a global online competition focused on bringing the next wave of high-impact projects to the Solana ecosystem.\n\nTracks include:\n- **DeFi & Payments**: Building the future of finance.\n- **Consumer Apps**: Mobile-first experiences for mass adoption.\n- **DePIN**: Decentralized Physical Infrastructure Networks.\n- **Gaming**: On-chain games and infrastructure.\n- **DAO & Governance**: Tools for decentralized communities.\n\nWinners receive non-dilutive prizes and pre-seed investment opportunities from the Colosseum accelerator.",
            "ai_score": 98, "difficulty": "Hard",
            "tags": ["Rust", "DeFi", "DePIN", "Consumer"],
            "required_skills": ["Must be built on Solana", "Open source code repository", "Short video demo (max 3 mins)", "Working prototype deployed to devnet/mainnet"],
            "ai_summary": "Build the next generation of dApps on Solana. Special tracks for DePIN, DeFi, and Consumer Apps.",
            "win_probability": "High",
            "estimated_value_usd": 1000000.0,
            "deadline": datetime.now() + timedelta(hours=48),
        },
        {
            "title": "Arbitrum Stylus Grant Program",
            "category": "Grant", "chain": "Arbitrum",
            "reward_pool": "$50,000 max", "source": "Gitcoin",
            "url": "https://arbitrum.foundation",
            "description": "Grants for developers building with Rust, C, or C++ on Stylus.",
            "ai_score": 92, "difficulty": "Hard",
            "tags": ["Rust", "C++", "Stylus"],
            "ai_summary": "Grants for developers building with Rust, C, or C++ on Stylus.",
            "estimated_value_usd": 50000.0,
            "deadline": datetime.now() + timedelta(days=20),
        },
        {
            "title": "Superteam Earn: DePIN Dashboard",
            "category": "Bounty", "chain": "Solana",
            "reward_pool": "$3,500", "source": "Superteam",
            "url": "https://earn.superteam.fun",
            "description": "Design and build a comprehensive analytics dashboard for a new DePIN protocol.",
            "ai_score": 88, "difficulty": "Medium",
            "tags": ["React", "Analytics", "DePIN"],
            "ai_summary": "Design and build a comprehensive analytics dashboard for a new DePIN protocol.",
            "estimated_value_usd": 3500.0,
            "deadline": datetime.now() + timedelta(hours=48),
        },
        {
            "title": "Optimism RetroPGF Round 4",
            "category": "Grant", "chain": "Optimism",
            "reward_pool": "Varies", "source": "Mirror",
            "url": "https://app.optimism.io/retropgf",
            "description": "Retroactive public goods funding for contributions to the Optimism ecosystem.",
            "ai_score": 85, "difficulty": "Medium",
            "tags": ["Public Goods", "Governance", "L2"],
            "ai_summary": "Retroactive public goods funding for contributions to the Optimism ecosystem.",
            "estimated_value_usd": 250000.0,
            "deadline": datetime.now() + timedelta(days=14),
        },
        {
            "title": "Scroll Mainnet Airdrop Strategy",
            "category": "Airdrop", "chain": "Scroll",
            "reward_pool": "Alpha", "source": "Alpha Feed",
            "url": "https://scroll.io",
            "description": "Potential airdrop criteria detected based on recent mainnet activity.",
            "ai_score": 95, "difficulty": "Easy",
            "tags": ["Bridge", "DEX", "Volume"],
            "ai_summary": "Potential airdrop criteria detected based on recent mainnet activity.",
            "estimated_value_usd": 0.0,
            "deadline": None,
        },
        {
            "title": "Base Onchain Summer II",
            "category": "Hackathon", "chain": "Base",
            "reward_pool": "$500,000", "source": "Warpcast",
            "url": "https://base.org/summer",
            "description": "Join the second Onchain Summer hackathon. Build on Base and get funded.",
            "ai_score": 78, "difficulty": "Medium",
            "tags": ["Onchain", "Consumer", "Social"],
            "ai_summary": "Join the second Onchain Summer hackathon. Build on Base and get funded.",
            "estimated_value_usd": 500000.0,
            "deadline": datetime.now() + timedelta(days=10),
        },
        {
            "title": "ZkSync Native Paymaster Bounty",
            "category": "Bounty", "chain": "ZkSync",
            "reward_pool": "$2,000", "source": "Bountycaster",
            "url": "https://bountycaster.xyz",
            "description": "Implement a native paymaster for gasless transactions on ZkSync Era.",
            "ai_score": 75, "difficulty": "Hard",
            "tags": ["Solidity", "ZK", "Paymaster"],
            "ai_summary": "Implement a native paymaster for gasless transactions on ZkSync Era.",
            "estimated_value_usd": 2000.0,
            "deadline": datetime.now() + timedelta(hours=72),
        },
        {
            "title": "Farcaster Frame Grant",
            "category": "Grant", "chain": "Base",
            "reward_pool": "$5,000", "source": "Farcaster",
            "url": "https://warpcast.com/grants",
            "description": "Build an innovative Frame that drives user engagement.",
            "ai_score": 91, "difficulty": "Medium",
            "tags": ["Frames", "Social", "React"],
            "ai_summary": "Build an innovative Frame that drives user engagement.",
            "estimated_value_usd": 5000.0,
            "deadline": datetime.now() + timedelta(days=3),
        },
        {
            "title": "Monad Community Ambassador Program",
            "category": "Ambassador", "chain": "Monad",
            "reward_pool": "Token Allocation", "source": "Twitter",
            "url": "https://monad.xyz/ambassadors",
            "description": "Join the Monad ecosystem as a lead community contributor. Responsibilities include content creation, local events, and technical moderation.",
            "ai_score": 94, "difficulty": "Easy",
            "tags": ["Community", "Content", "Moderation"],
            "ai_summary": "Join the Monad ecosystem as a community lead for content and moderation.",
            "estimated_value_usd": 12000.0,
            "deadline": datetime.now() + timedelta(days=30),
        },
        {
            "title": "Berachain Artio Testnet Campaign",
            "category": "Testnet", "chain": "Berachain",
            "reward_pool": "Future Airdrop", "source": "Galaxy",
            "url": "https://berachain.com",
            "description": "Participate in the Artio testnet by swapping, lending, and providing liquidity to earn Proof of Liquidity points.",
            "ai_score": 96, "difficulty": "Easy",
            "tags": ["Testnet", "DeFi", "Liquidity"],
            "ai_summary": "Interact with Berachain testnet to qualify for future rewards.",
            "estimated_value_usd": 0.0,
            "deadline": None,
        },
        {
            "title": "Hyperlane Bridging Quest",
            "category": "Airdrop Alpha", "chain": "Multi-chain",
            "reward_pool": "Alpha", "source": "Alpha Feed",
            "url": "https://hyperlane.xyz",
            "description": "Bridge assets using Hyperlane to maximize cross-chain interaction scores. Potential criteria for upcoming distribution.",
            "ai_score": 89, "difficulty": "Easy",
            "tags": ["Bridge", "Interoperability", "Staking"],
            "ai_summary": "Strategic bridging guide for Hyperlane ecosystem rewards.",
            "estimated_value_usd": 0.0,
            "deadline": datetime.now() + timedelta(days=7),
        },
    ]

    created = 0
    updated = 0
    for data in opps_data:
        existing = db.query(Opportunity).filter(Opportunity.title == data["title"]).first()
        if not existing:
            db.add(Opportunity(**data))
            created += 1
        else:
            for key, value in data.items():
                setattr(existing, key, value)
            updated += 1
    print(f"  ✓ {created} opportunities seeded, {updated} updated")

    # ─── 4. Demo Tracked Applications (for Tracker page) ───
    if demo and demo.id:
        # Get opportunity IDs after flush
        db.flush()
        opp_optimism = db.query(Opportunity).filter(Opportunity.title == "Optimism RetroPGF Round 4").first()
        opp_solana = db.query(Opportunity).filter(Opportunity.title == "Solana Foundation Renaissance Hackathon").first()

        tracks = [
            {"user_id": demo.id, "opportunity_id": opp_optimism.id if opp_optimism else 1, "status": "In Review"},
            {"user_id": demo.id, "opportunity_id": opp_solana.id if opp_solana else 2, "status": "Draft"},
        ]
        for t in tracks:
            if not db.query(TrackedApplication).filter(
                TrackedApplication.user_id == t["user_id"],
                TrackedApplication.opportunity_id == t["opportunity_id"]
            ).first():
                db.add(TrackedApplication(**t))
        print("  ✓ Demo tracked applications seeded")

    db.commit()
    db.close()
    print("\n🌱 Seed complete!")

if __name__ == "__main__":
    seed_db()
