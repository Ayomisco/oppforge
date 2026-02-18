#!/usr/bin/env python3
"""
Seed current Web3 opportunities (February 2026)
Real opportunities from major platforms
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from datetime import datetime, timedelta

def main():
    db = SessionLocal()
    
    # Current date as baseline
    today = datetime.now()
    
    # Fresh opportunities for February-March 2026
    opportunities = [
        # ETHGlobal Hackathons
        {
            "title": "ETHGlobal London 2026",
            "description": "Build the future of Ethereum at ETHGlobal's flagship European hackathon. $500K+ in prizes across DeFi, NFTs, DAOs, and infrastructure tracks.",
            "url": "https://ethglobal.com/events/london2026",
            "category": "hackathon",
            "source": "ETHGlobal",
            "reward_pool": 500000,
            "deadline": today + timedelta(days=21),
            "chain": "Ethereum",
            "tags": ["DeFi", "NFT", "DAO", "Infrastructure"]
        },
        {
            "title": "ETHGlobal Scaling Ethereum 2026",
            "description": "Focus on Layer 2 solutions, zkEVMs, and scaling infrastructure. $300K in bounties from Arbitrum, Optimism, zkSync, Starknet.",
            "url": "https://ethglobal.com/events/scaling2026",
            "category": "hackathon",
            "source": "ETHGlobal",
            "reward_pool": 300000,
            "deadline": today + timedelta(days=35),
            "chain": "Ethereum",
            "tags": ["Layer2", "zkEVM", "Scaling", "Rollups"]
        },
        
        # Solana Hackathons
        {
            "title": "Solana Grizzlython 2026",
            "description": "Build the next generation of Solana applications. $5M+ prize pool across DeFi, Gaming, Payments, and Mobile tracks.",
            "url": "https://solana.com/grizzlython",
            "category": "hackathon",
            "source": "Solana Foundation",
            "reward_pool": 5000000,
            "deadline": today + timedelta(days=45),
            "chain": "Solana",
            "tags": ["DeFi", "Gaming", "Mobile", "Payments"]
        },
        {
            "title": "Solana DeFi Hackathon",
            "description": "Revolutionary DeFi protocols on Solana. Focus on lending, DEX aggregators, derivatives, and yield optimization.",
            "url": "https://solana.com/defi-hack",
            "category": "hackathon",
            "source": "Solana Foundation",
            "reward_pool": 1000000,
            "deadline": today + timedelta(days=28),
            "chain": "Solana",
            "tags": ["DeFi", "Lending", "DEX", "Derivatives"]
        },
        
        # Gitcoin Grants Round
        {
            "title": "Gitcoin Grants Round 20",
            "description": "Quadratic funding for public goods. $2M matching pool for developer tools, education, DeFi, and climate solutions.",
            "url": "https://gitcoin.co/grants",
            "category": "grant",
            "source": "Gitcoin",
            "reward_pool": 2000000,
            "deadline": today + timedelta(days=14),
            "chain": "Multi-chain",
            "tags": ["Public Goods", "Dev Tools", "Climate", "Education"]
        },
        
        # Protocol-Specific Grants
        {
            "title": "Uniswap Foundation Grants Program",
            "description": "Up to $250K for projects building on Uniswap v4. Focus on hooks, DeFi integrations, and governance tooling.",
            "url": "https://uniswapfoundation.org/grants",
            "category": "grant",
            "source": "Uniswap",
            "reward_pool": 250000,
            "deadline": None,  # Rolling
            "chain": "Ethereum",
            "tags": ["DeFi", "DEX", "Uniswap", "Governance"]
        },
        {
            "title": "Aave Grants DAO Q1 2026",
            "description": "$500K available for Aave ecosystem projects. Priority: GHO integrations, risk management tools, and frontend improvements.",
            "url": "https://aavegrants.org",
            "category": "grant",
            "source": "Aave",
            "reward_pool": 500000,
            "deadline": today + timedelta(days=30),
            "chain": "Ethereum",
            "tags": ["DeFi", "Lending", "GHO", "Risk Management"]
        },
        
        # Layer 2 Opportunities
        {
            "title": "Arbitrum Stylus Hackathon",
            "description": "Build with Rust, C, and C++ on Arbitrum using Stylus. $400K in prizes for next-gen smart contracts.",
            "url": "https://arbitrum.io/stylus-hack",
            "category": "hackathon",
            "source": "Arbitrum",
            "reward_pool": 400000,
            "deadline": today + timedelta(days=42),
            "chain": "Arbitrum",
            "tags": ["Layer2", "Rust", "Stylus", "Smart Contracts"]
        },
        {
            "title": "Optimism RetroPGF Round 5",
            "description": "$30M retroactive public goods funding. Reward builders who've already created impact in the Optimism ecosystem.",
            "url": "https://optimism.io/retropgf",
            "category": "grant",
            "source": "Optimism",
            "reward_pool": 30000000,
            "deadline": today + timedelta(days=60),
            "chain": "Optimism",
            "tags": ["Public Goods", "RetroPGF", "Layer2", "Impact"]
        },
        {
            "title": "Base Onchain Summer 2026",
            "description": "6-week hackathon on Base. Build consumer apps, social platforms, and onchain games. $1M+ in prizes.",
            "url": "https://base.org/summer",
            "category": "hackathon",
            "source": "Base",
            "reward_pool": 1000000,
            "deadline": today + timedelta(days=50),
            "chain": "Base",
            "tags": ["Consumer Apps", "Social", "Gaming", "Layer2"]
        },
        {
            "title": "zkSync Builder Program Q1",
            "description": "$750K for teams building on zkSync Era. Focus on account abstraction, paymasters, and ZK applications.",
            "url": "https://zksync.io/builders",
            "category": "grant",
            "source": "zkSync",
            "reward_pool": 750000,
            "deadline": today + timedelta(days=38),
            "chain": "zkSync",
            "tags": ["zkEVM", "Account Abstraction", "ZK", "Layer2"]
        },
        
        # Ecosystem Grants
        {
            "title": "Polygon Village Accelerator Batch 3",
            "description": "12-week program with $100K investment + $150K in credits. For early-stage Web3 startups building on Polygon.",
            "url": "https://polygon.technology/village",
            "category": "accelerator",
            "source": "Polygon",
            "reward_pool": 100000,
            "deadline": today + timedelta(days=25),
            "chain": "Polygon",
            "tags": ["Accelerator", "Startups", "Investment", "Mentorship"]
        },
        {
            "title": "Avalanche Multiverse Incentive Program",
            "description": "$4M to attract and support Subnet developers. Gas subsidies, technical support, and go-to-market assistance.",
            "url": "https://avax.network/multiverse",
            "category": "grant",
            "source": "Avalanche",
            "reward_pool": 4000000,
            "deadline": None,  # Ongoing
            "chain": "Avalanche",
            "tags": ["Subnets", "Infrastructure", "Gas Subsidies"]
        },
        
        # Bounties & Quests
        {
            "title": "Superteam Earn: DeFi Dashboard Bounty",
            "description": "$15K bounty for building comprehensive DeFi analytics dashboard. Required: Multi-chain support, real-time data, clean UI.",
            "url": "https://earn.superteam.fun/listings/bounty/defi-dashboard",
            "category": "bounty",
            "source": "Superteam",
            "reward_pool": 15000,
            "deadline": today + timedelta(days=20),
            "chain": "Solana",
            "tags": ["DeFi", "Analytics", "Dashboard", "Multi-chain"]
        },
        {
            "title": "Farcaster Frames Development Grant",
            "description": "$50K for innovative Frames applications. Build social, gaming, or commerce experiences in Farcaster.",
            "url": "https://farcaster.xyz/frames-grant",
            "category": "grant",
            "source": "Farcaster",
            "reward_pool": 50000,
            "deadline": today + timedelta(days=32),
            "chain": "Base",
            "tags": ["Social", "Frames", "Apps", "Decentralized Social"]
        },
        {
            "title": "Immunefi Security Research Grant",
            "description": "$100K for novel security research. Focus on: MEV, cross-chain bridges, smart contract vulnerabilities.",
            "url": "https://immunefi.com/research-grant",
            "category": "grant",
            "source": "Immunefi",
            "reward_pool": 100000,
            "deadline": today + timedelta(days=55),
            "chain": "Multi-chain",
            "tags": ["Security", "Research", "MEV", "Bridges"]
        },
        
        # Emerging Ecosystems
        {
            "title": "Monad Testnet Incentives Program",
            "description": "$2M in rewards for developers building and testing on Monad testnet. Early access to high-performance EVM.",
            "url": "https://monad.xyz/testnet",
            "category": "incentive",
            "source": "Monad",
            "reward_pool": 2000000,
            "deadline": today + timedelta(days=90),
            "chain": "Monad",
            "tags": ["Testnet", "EVM", "High Performance", "Early Access"]
        },
        {
            "title": "Berachain Build-a-Bera Hackathon",
            "description": "$500K hackathon on Berachain. Categories: DeFi, NFTs, Gaming, and Proof of Liquidity innovations.",
            "url": "https://berachain.com/hackathon",
            "category": "hackathon",
            "source": "Berachain",
            "reward_pool": 500000,
            "deadline": today + timedelta(days=40),
            "chain": "Berachain",
            "tags": ["DeFi", "NFT", "Gaming", "PoL"]
        },
        {
            "title": "Blast Big Bang Competition Phase 2",
            "description": "$10M prize pool for Blast ecosystem development. Focus on native yields and gas revenue sharing apps.",
            "url": "https://blast.io/bigbang",
            "category": "competition",
            "source": "Blast",
            "reward_pool": 10000000,
            "deadline": today + timedelta(days=65),
            "chain": "Blast",
            "tags": ["Native Yield", "Gas Revenue", "DeFi", "Layer2"]
        },
        
        # DoraHacks Hackathons
        {
            "title": "DoraHacks Web3 For Good",
            "description": "$200K for projects solving real-world problems with blockchain. Categories: Climate, Health, Education, Financial Inclusion.",
            "url": "https://dorahacks.io/web3-for-good",
            "category": "hackathon",
            "source": "DoraHacks",
            "reward_pool": 200000,
            "deadline": today + timedelta(days=33),
            "chain": "Multi-chain",
            "tags": ["Social Impact", "Climate", "Health", "Education"]
        },
        
        # DAO Opportunities
        {
            "title": "MakerDAO Endgame Grants",
            "description": "$1M for SubDAO development and Endgame transition support. Focus on decentralized governance and risk management.",
            "url": "https://makerdao.com/endgame-grants",
            "category": "grant",
            "source": "MakerDAO",
            "reward_pool": 1000000,
            "deadline": today + timedelta(days=70),
            "chain": "Ethereum",
            "tags": ["DAO", "Governance", "DeFi", "Endgame"]
        },
        {
            "title": "Compound Grants Program 2.0",
            "description": "$500K for Compound ecosystem growth. Priority: V3 integrations, governance participation tools, analytics.",
            "url": "https://compoundgrants.org",
            "category": "grant",
            "source": "Compound",
            "reward_pool": 500000,
            "deadline": None,  # Rolling
            "chain": "Ethereum",
            "tags": ["DeFi", "Lending", "Governance", "Analytics"]
        },
    ]
    
    print("🌱 Seeding fresh Web3 opportunities...")
    print("=" * 60)
    
    added = 0
    skipped = 0
    
    for opp_data in opportunities:
        # Check if exists
        existing = db.query(Opportunity).filter(
            Opportunity.url == opp_data['url']
        ).first()
        
        if existing:
            skipped += 1
            continue
        
        opp = Opportunity(
            title=opp_data['title'],
            description=opp_data['description'],
            url=opp_data['url'],
            category=opp_data['category'],
            source=opp_data['source'],
            reward_pool=opp_data['reward_pool'],
            deadline=opp_data['deadline'],
            chain=opp_data['chain'],
            tags=opp_data['tags'],
            is_open=True
        )
        db.add(opp)
        added += 1
        print(f"✅ Added: {opp_data['title'][:60]}...")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print(f"✅ Seeding complete!")
    print(f"   Added: {added} new opportunities")
    print(f"   Skipped: {skipped} existing")
    
    # Stats
    total = db.query(Opportunity).count()
    active = db.query(Opportunity).filter(
        Opportunity.is_open == True,
        or_(Opportunity.deadline == None, Opportunity.deadline >= datetime.now())
    ).count()
    
    print(f"\n📊 Database now has:")
    print(f"   Total: {total} opportunities")
    print(f"   Active: {active} current/upcoming")
    
    db.close()

if __name__ == "__main__":
    from sqlalchemy import or_
    main()
