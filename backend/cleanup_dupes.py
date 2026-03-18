#!/usr/bin/env python3
"""Remove old generic seeded entries that have comprehensive replacements."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()
from app.database import SessionLocal
from app.models.opportunity import Opportunity

db = SessionLocal()

# Remove the old "Base Onchain Summer 2026" duplicate (score=0)
old_base = db.query(Opportunity).filter(
    Opportunity.id == "8b888c70-c2ba-4259-835d-4d4fbb580a34"
).first()
if old_base:
    db.delete(old_base)
    print(f"Deleted old: {old_base.title} (score={old_base.ai_score})")

# Now clean up old seeded entries that have score=0 and generic descriptions
# These are from the original seed_fresh_opportunities.py
old_seeds = db.query(Opportunity).filter(
    Opportunity.ai_score == 0,
    Opportunity.source.in_(["ETHGlobal", "Solana Foundation", "Gitcoin", "Uniswap",
        "Aave", "Arbitrum", "Optimism", "Base", "zkSync", "Polygon", "Avalanche",
        "Superteam", "Farcaster", "Immunefi", "Monad", "Berachain", "Blast",
        "DoraHacks", "MakerDAO", "Compound"])
).all()

removed = 0
for opp in old_seeds:
    # Only delete if there's a comprehensive replacement (same title exists with score > 0)
    replacement = db.query(Opportunity).filter(
        Opportunity.title == opp.title,
        Opportunity.ai_score > 0
    ).first()
    if replacement:
        print(f"Deleted old duplicate: {opp.title} (score={opp.ai_score})")
        db.delete(opp)
        removed += 1

db.commit()
print(f"\nCleaned up {removed + (1 if old_base else 0)} old entries")
total = db.query(Opportunity).count()
print(f"Database now has {total} total opportunities")
db.close()
