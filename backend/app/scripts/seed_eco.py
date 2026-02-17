"""Quick ecosystem seeding with 40+ ecosystems"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.ecosystem import Ecosystem

def seed():
    # Create table first
    Base.metadata.create_all(bind=engine, tables=[Ecosystem.__table__])
    
    db = SessionLocal()
    try:
        print("🗑️  Clearing existing...")
        db.query(Ecosystem).delete()
        db.commit()
        
        ecosystems = [
            # TIER 1 - L1s
            Ecosystem(name="Ethereum Foundation", slug="ethereum", type="L1", tier=1, official_website="https://ethereum.org", official_grants_url="https://ethereum.org/en/community/grants/", twitter_url="https://twitter.com/ethereum", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Solana Foundation", slug="solana", type="L1", tier=1, official_website="https://solana.com", official_grants_url="https://solana.org/grants", twitter_url="https://twitter.com/solana", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Avalanche Foundation", slug="avalanche", type="L1", tier=1, official_website="https://www.avax.network", official_grants_url="https://www.avax.network/grants", twitter_url="https://twitter.com/avalancheavax", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="BNB Chain", slug="bnb-chain", type="L1", tier=1, official_website="https://www.bnbchain.org", official_grants_url="https://www.bnbchain.org/en/developers/grants", twitter_url="https://twitter.com/bnbchain", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Cardano Foundation", slug="cardano", type="L1", tier=1, official_website="https://cardano.org", official_grants_url="https://cardano.ideascale.com", twitter_url="https://twitter.com/cardano", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="NEAR Foundation", slug="near", type="L1", tier=1, official_website="https://near.org", official_grants_url="https://near.org/grants", twitter_url="https://twitter.com/nearprotocol", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Algorand Foundation", slug="algorand", type="L1", tier=1, official_website="https://algorand.foundation", official_grants_url="https://algorand.foundation/grants-program", twitter_url="https://twitter.com/algorand", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Tezos Foundation", slug="tezos", type="L1", tier=1, official_website="https://tezos.com", official_grants_url="https://tezos.foundation/grants", twitter_url="https://twitter.com/tezos", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Cosmos Hub", slug="cosmos", type="L1", tier=1, official_website="https://cosmos.network", official_grants_url="https://grants.cosmos.network", twitter_url="https://twitter.com/cosmos", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Polkadot", slug="polkadot", type="L1", tier=1, official_website="https://polkadot.network", official_grants_url="https://grants.web3.foundation", twitter_url="https://twitter.com/polkadot", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Sui Foundation", slug="sui", type="L1", tier=1, official_website="https://sui.io", official_grants_url="https://sui.io/grants", twitter_url="https://twitter.com/SuiNetwork", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Aptos Foundation", slug="aptos", type="L1", tier=1, official_website="https://aptoslabs.com", official_grants_url="https://aptosfoundation.org/grants", twitter_url="https://twitter.com/Aptos", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Stellar Development Foundation", slug="stellar", type="L1", tier=1, official_website="https://stellar.org", official_grants_url="https://stellar.org/foundation/grants-and-funding", twitter_url="https://twitter.com/StellarOrg", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Internet Computer", slug="internet-computer", type="L1", tier=1, official_website="https://internetcomputer.org", official_grants_url="https://dfinity.org/grants", twitter_url="https://twitter.com/dfinity", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Hedera", slug="hedera", type="L1", tier=1, official_website="https://hedera.com", official_grants_url="https://hedera.com/grants", twitter_url="https://twitter.com/hedera", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Flow Foundation", slug="flow", type="L1", tier=1, official_website="https://flow.com", official_grants_url="https://flow.com/ecosystemfund", twitter_url="https://twitter.com/flow_blockchain", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="TRON DAO", slug="tron-dao", type="L1", tier=1, official_website="https://trondao.org", official_grants_url="https://trondao.org/grants", twitter_url="https://twitter.com/trondao", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="MultiversX", slug="multiversx", type="L1", tier=1, official_website="https://multiversx.com", official_grants_url="https://multiversx.com/builders/grants", twitter_url="https://twitter.com/MultiversX", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="TON Foundation", slug="ton", type="L1", tier=1, official_website="https://ton.org", official_grants_url="https://ton.org/grants", twitter_url="https://twitter.com/ton_blockchain", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Kadena", slug="kadena", type="L1", tier=1, official_website="https://kadena.io", official_grants_url="https://kadena.io/grants", twitter_url="https://twitter.com/kadena_io", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            
            # TIER 2 - L2s
            Ecosystem(name="Arbitrum Foundation", slug="arbitrum", type="L2", tier=2, official_website="https://arbitrum.foundation", official_grants_url="https://arbitrum.foundation/grants", twitter_url="https://twitter.com/arbitrum", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Optimism Foundation", slug="optimism", type="L2", tier=2, official_website="https://www.optimism.io", official_grants_url="https://gov.optimism.io/c/grants/43", twitter_url="https://twitter.com/optimismFND", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Polygon Labs", slug="polygon", type="L2", tier=2, official_website="https://polygon.technology", official_grants_url="https://polygon.technology/village/grants", twitter_url="https://twitter.com/0xPolygon", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="zkSync", slug="zksync", type="L2", tier=2, official_website="https://zksync.io", official_grants_url="https://zksync.mirror.xyz/grant", twitter_url="https://twitter.com/zksync", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Starknet Foundation", slug="starknet", type="L2", tier=2, official_website="https://starknet.io", official_grants_url="https://starknet.io/grants", twitter_url="https://twitter.com/Starknet", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Base", slug="base", type="L2", tier=2, official_website="https://base.org", official_grants_url="https://base.org/ecosystem", twitter_url="https://twitter.com/base", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Linea", slug="linea", type="L2", tier=2, official_website="https://linea.build", official_grants_url="https://linea.build/grants", twitter_url="https://twitter.com/LineaBuild", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Mantle Network", slug="mantle", type="L2", tier=2, official_website="https://www.mantle.xyz", official_grants_url="https://www.mantle.xyz/grants", twitter_url="https://twitter.com/0xMantle", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Scroll", slug="scroll", type="L2", tier=2, official_website="https://scroll.io", official_grants_url="https://scroll.io/grants", twitter_url="https://twitter.com/Scroll_ZKP", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Blast", slug="blast", type="L2", tier=2, official_website="https://blast.io", official_grants_url="https://blast.io/en/grants", twitter_url="https://twitter.com/Blast_L2", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Metis", slug="metis", type="L2", tier=2, official_website="https://www.metis.io", official_grants_url="https://www.metis.io/grants", twitter_url="https://twitter.com/MetisL2", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Mode Network", slug="mode", type="L2", tier=2, official_website="https://www.mode.network", official_grants_url="https://www.mode.network/ecosystem", twitter_url="https://twitter.com/modenetwork", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Taiko", slug="taiko", type="L2", tier=2, official_website="https://taiko.xyz", official_grants_url="https://taiko.xyz/ecosystem", twitter_url="https://twitter.com/taikoxyz", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Manta Network", slug="manta", type="L2", tier=2, official_website="https://manta.network", official_grants_url="https://manta.network/grants", twitter_url="https://twitter.com/MantaNetwork", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Immutable", slug="immutable", type="L2", tier=2, official_website="https://www.immutable.com", official_grants_url="https://www.immutable.com/grants", twitter_url="https://twitter.com/Immutable", has_grants=True, has_bounties=True, has_hackathons=True, has_ambassadors=True, scraper_enabled=True, scraper_priority=1),
            
            # Grant & Bounty Platforms
            Ecosystem(name="Gitcoin", slug="gitcoin", type="Platform", tier=1, official_website="https://gitcoin.co", official_grants_url="https://gitcoin.co/grants", twitter_url="https://twitter.com/gitcoin", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="DoraHacks", slug="dorahacks", type="Platform", tier=1, official_website="https://dorahacks.io", official_grants_url="https://dorahacks.io/grants", twitter_url="https://twitter.com/DoraHacks", has_grants=True, has_bounties=True, has_hackathons=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Devpost", slug="devpost", type="Platform", tier=1, official_website="https://devpost.com", official_grants_url="https://devpost.com/hackathons", twitter_url="https://twitter.com/devpost", has_hackathons=True, scraper_enabled=True, scraper_priority=1),
            Ecosystem(name="Immunefi", slug="immunefi", type="Platform", tier=1, official_website="https://immunefi.com", official_grants_url="https://immunefi.com/explore", twitter_url="https://twitter.com/immunefi", has_bounties=True, scraper_enabled=True, scraper_priority=1),
            
            # DeFi Protocols
            Ecosystem(name="Uniswap Foundation", slug="uniswap", type="DeFi", tier=2, official_website="https://uniswap.org", official_grants_url="https://uniswap.org/grants", twitter_url="https://twitter.com/Uniswap", has_grants=True, scraper_enabled=True, scraper_priority=2),
            Ecosystem(name="Aave Grants", slug="aave", type="DeFi", tier=2, official_website="https://aave.com", official_grants_url="https://aavegrants.org", twitter_url="https://twitter.com/AaveAave", has_grants=True, scraper_enabled=True, scraper_priority=2),
        ]
        
        for eco in ecosystems:
            db.add(eco)
        db.commit()
        
        count = db.query(Ecosystem).count()
        print(f"✅ Successfully seeded {count} ecosystems!")
        
        tier1 = db.query(Ecosystem).filter(Ecosystem.tier == 1).count()
        tier2 = db.query(Ecosystem).filter(Ecosystem.tier == 2).count()
        print(f"\n📊 Tier 1: {tier1} | Tier 2: {tier2} | Total: {count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🌍 Seeding Ecosystems\n")
    seed()
    print("\n🎉 Complete!")
