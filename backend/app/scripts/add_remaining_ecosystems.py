"""
Add remaining ecosystems (109 more to reach 150+)
Simple version with correct model fields
"""

from app.database import SessionLocal
from app.models.ecosystem import Ecosystem
from datetime import datetime
import uuid

def add_remaining_ecosystems():
    db = SessionLocal()
    
    try:
        existing = db.query(Ecosystem).count()
        print(f"📊 Current ecosystems: {existing}")
        
        # Check which exist
        existing_names = [e.name for e in db.query(Ecosystem.name).all()]
        
        # Define all ecosystems to add
        new_ecosystems = []
        
        # Cosmos Ecosystem (add if not exist)
        cosmos_chains = [
            "Osmosis", "Injective", "Celestia", "Sei Network", "dYdX Chain",
            "Noble", "Kujira", "Juno", "Akash", "Persistence",
            "Secret Network", "Stride", "Neutron", "Saga", "Archway"
        ]
        
        for name in cosmos_chains:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="Cosmos",
                    tier=3,
                    has_grants=True,
                    official_grants_url=f"https://{name.lower().replace(' ', '')}.zone",
                    twitter_url=f"https://twitter.com/{name.replace(' ', '')}",
                    scraper_enabled=True,
                    scraper_frequency="daily",
                    scraper_priority=5
                ))
        
        # DeFi Protocols
        defi = [
            ("SushiSwap", "https://sushi.com"),
            ("Balancer", "https://balancer.fi"),
            ("GMX", "https://gmx.io"),
            ("Yearn Finance", "https://yearn.fi"),
            ("Synthetix", "https://synthetix.io"),
            ("Convex", "https://convex.finance"),
        ]
        
        for name, url in defi:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="DeFi",
                    tier=2,
                    has_grants=True,
                    has_bounties=True,
                    official_grants_url=url,
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="12h",
                    scraper_priority=7
                ))
        
        # Gaming Ecosystems
        gaming = [
            ("Sky Mavis", "https://skymavis.com"),
            ("Gala Games", "https://gala.games"),
            ("Beam", "https://beam.eco"),
            ("Treasure DAO", "https://treasure.lol"),
        ]
        
        for name, url in gaming:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="Gaming",
                    tier=3,
                    has_grants=True,
                    has_hackathons=True,
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="daily",
                    scraper_priority=6
                ))
        
        # DAOs
        daos = [
            ("Aragon", "https://aragon.org"),
            ("DAOhaus", "https://daohaus.club"),
            ("Nouns DAO", "https://nouns.wtf"),
            ("ENS DAO", "https://ens.domains"),
            ("Bankless DAO", "https://bankless.community"),
        ]
        
        for name, url in daos:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="DAO",
                    tier=3,
                    has_grants=True,
                    has_bounties=True,
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="daily",
                    scraper_priority=6
                ))
        
        # Modular & Infrastructure
        infrastructure = [
            ("EigenLayer", "https://eigenlayer.xyz"),
            ("LayerZero", "https://layerzero.network"),
            ("Wormhole", "https://wormhole.com"),
            ("The Graph", "https://thegraph.com"),
            ("Arweave", "https://arweave.org"),
            ("Filecoin", "https://filecoin.io"),
            ("Aleph.im", "https://aleph.im"),
            ("Ankr", "https://ankr.com"),
            ("Pyth Network", "https://pyth.network"),
            ("API3", "https://api3.org"),
        ]
        
        for name, url in infrastructure:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-").replace(".", ""),
                    type="Infrastructure",
                    tier=2,
                    has_grants=True,
                    official_grants_url=f"{url}/grants",
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="12h",
                    scraper_priority=7
                ))
        
        # Additional L1s
        l1_chains = [
            ("Harmony", "https://harmony.one"),
            ("Moonbeam", "https://moonbeam.network"),
            ("Moonriver", "https://moonriver.network"),
            ("Gnosis Chain", "https://gnosis.io"),
            ("Kava", "https://kava.io"),
            ("Theta", "https://thetatoken.org"),
            ("Zilliqa", "https://zilliqa.com"),
            ("VeChain", "https://vechain.org"),
            ("BitTorrent Chain", "https://bt.io"),
            ("Oasis Network", "https://oasisprotocol.org"),
            ("Canto", "https://canto.io"),
            ("Berachain", "https://berachain.com"),
            ("Shardeum", "https://shardeum.org"),
            ("Monad", "https://monad.xyz"),
            ("Hyperliquid", "https://hyperliquid.xyz"),
            ("Conflux", "https://confluxnetwork.org"),
            ("Chiliz", "https://chiliz.com"),
            ("Radix", "https://radixdlt.com"),
            ("Aleo", "https://aleo.org"),
            ("Mina", "https://minaprotocol.com"),
            ("Core DAO", "https://coredao.org"),
            ("PulseChain", "https://pulsechain.com"),
        ]
        
        for name, url in l1_chains:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="L1",
                    tier=3,
                    has_grants=True,
                    official_grants_url=f"{url}/grants",
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="daily",
                    scraper_priority=5
                ))
        
        # Additional L2s
        l2_chains = [
            ("Boba Network", "https://boba.network"),
            ("Fuel Network", "https://fuel.network"),
            ("zkLink", "https://zk.link"),
            ("StarkEx", "https://starkware.co/starkex"),
            ("Immutable X", "https://immutable.com"),
        ]
        
        for name, url in l2_chains:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type="L2",
                    tier=3,
                    has_grants=True,
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="daily",
                    scraper_priority=5
                ))
        
        # Hackathon/Grant Programs (Ecosystem-specific)
        programs = [
            ("ETHGlobal", "https://ethglobal.com", "Platform"),
            ("Solana Hackathon", "https://solana.com/hackathon", "Platform"),
            ("Avalanche Multiverse", "https://avax.network/multiverse", "Platform"),
            ("Polygon Ecosystem Fund", "https://polygon.technology/ecosystem-fund", "Platform"),
            ("Arbitrum DAO", "https://arbitrum.foundation", "Platform"),
            ("Optimism RetroPGF", "https://optimism.io/retropgf", "Platform"),
        ]
        
        for name, url, type_ in programs:
            if name not in existing_names:
                new_ecosystems.append(Ecosystem(
                    id=uuid.uuid4(),
                    name=name,
                    slug=name.lower().replace(" ", "-"),
                    type=type_,
                    tier=1,
                    has_grants=True,
                    has_hackathons=True,
                    official_grants_url=url,
                    official_website=url,
                    scraper_enabled=True,
                    scraper_frequency="6h",
                    scraper_priority=9
                ))
        
        print(f"\n📦 Adding {len(new_ecosystems)} new ecosystems...")
        
        if new_ecosystems:
            db.bulk_save_objects(new_ecosystems)
            db.commit()
        
        final_count = db.query(Ecosystem).count()
        print(f"✅ Complete! Total ecosystems: {final_count}")
        print(f"   Added: {final_count - existing}")
        
        # Stats
        tier1 = db.query(Ecosystem).filter(Ecosystem.tier == 1).count()
        tier2 = db.query(Ecosystem).filter(Ecosystem.tier == 2).count()
        tier3 = db.query(Ecosystem).filter(Ecosystem.tier == 3).count()
        
        print(f"\n📊 Breakdown:")
        print(f"   Tier 1: {tier1}")
        print(f"   Tier 2: {tier2}")
        print(f"   Tier 3: {tier3}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌍 Adding Remaining Ecosystems to OppForge")
    print("=" * 50)
    add_remaining_ecosystems()
