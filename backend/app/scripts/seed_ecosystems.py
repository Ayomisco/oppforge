from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.ecosystem import Ecosystem
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_ecosystems():
    """
    Seeds the database with Tier 1, 2, 3 ecosystems and more.
    """
    db = SessionLocal()
    
    # Ensure table exists
    Base.metadata.create_all(bind=engine)
    
    ecosystems_data = [
        # TIER 1 — Major L1 Ecosystems
        {"name": "Ethereum", "type": "L1", "has_grants": True, "has_hackathons": True, "official_grants_url": "https://esp.ethereum.foundation", "twitter_handle": "ethereum"},
        {"name": "Solana", "type": "L1", "has_grants": True, "has_hackathons": True, "official_grants_url": "https://solana.org/grants", "twitter_handle": "solana"},
        {"name": "Avalanche", "type": "L1", "has_grants": True, "has_bounties": True, "official_grants_url": "https://www.avax.network/community/grants", "twitter_handle": "avax"},
        {"name": "BNB Chain", "type": "L1", "has_grants": True, "has_hackathons": True, "twitter_handle": "BNBCHAIN"},
        {"name": "Cardano", "type": "L1", "has_grants": True, "twitter_handle": "Cardano"},
        {"name": "NEAR", "type": "L1", "has_grants": True, "twitter_handle": "NEARProtocol"},
        {"name": "Algorand", "type": "L1", "has_grants": True, "twitter_handle": "Algorand"},
        {"name": "Tezos", "type": "L1", "has_grants": True, "twitter_handle": "tezos"},
        {"name": "Cosmos Hub", "type": "L1", "has_grants": True, "twitter_handle": "cosmoshub"},
        {"name": "Polkadot", "type": "L1", "has_grants": True, "twitter_handle": "Polkadot"},
        {"name": "Sui", "type": "L1", "has_grants": True, "has_hackathons": True, "twitter_handle": "SuiNetwork"},
        {"name": "Aptos", "type": "L1", "has_grants": True, "has_hackathons": True, "twitter_handle": "Aptos_Network"},
        {"name": "Stellar", "type": "L1", "has_grants": True, "twitter_handle": "StellarOrg"},
        {"name": "Internet Computer", "type": "L1", "has_grants": True, "twitter_handle": "dfinity"},
        {"name": "Hedera", "type": "L1", "has_grants": True, "twitter_handle": "hedera"},
        {"name": "Flow", "type": "L1", "has_grants": True, "twitter_handle": "flow_blockchain"},
        {"name": "TRON", "type": "L1", "has_grants": True, "twitter_handle": "trondao"},
        {"name": "MultiversX", "type": "L1", "has_grants": True, "twitter_handle": "MultiversX"},
        {"name": "TON", "type": "L1", "has_grants": True, "twitter_handle": "ton_blockchain"},
        {"name": "Kadena", "type": "L1", "has_grants": True, "twitter_handle": "kadena_io"},

        # TIER 2 — Major Ethereum L2 Ecosystems
        {"name": "Arbitrum", "type": "L2", "has_grants": True, "has_bounties": True, "twitter_handle": "arbitrum"},
        {"name": "Optimism", "type": "L2", "has_grants": True, "has_hackathons": True, "twitter_handle": "Optimism"},
        {"name": "Polygon", "type": "L2", "has_grants": True, "has_hackathons": True, "twitter_handle": "0xPolygon"},
        {"name": "zkSync", "type": "L2", "has_grants": True, "has_hackathons": True, "twitter_handle": "zksync"},
        {"name": "Starknet", "type": "L2", "has_grants": True, "has_hackathons": True, "twitter_handle": "Starknet"},
        {"name": "Base", "type": "L2", "has_grants": True, "has_hackathons": True, "twitter_handle": "base"},
        {"name": "Linea", "type": "L2", "has_grants": True, "twitter_handle": "LineaBuild"},
        {"name": "Mantle", "type": "L2", "has_grants": True, "twitter_handle": "0xMantle"},
        {"name": "Scroll", "type": "L2", "has_grants": True, "twitter_handle": "Scroll_ZKP"},
        {"name": "Blast", "type": "L2", "has_hackathons": True, "twitter_handle": "Blast_L2"},
        {"name": "Metis", "type": "L2", "has_grants": True, "twitter_handle": "MetisL2"},
        {"name": "Mode", "type": "L2", "has_grants": True, "twitter_handle": "ModeNetwork"},
        {"name": "Taiko", "type": "L2", "has_grants": True, "twitter_handle": "taikoxyz"},
        {"name": "Manta", "type": "L2", "has_grants": True, "twitter_handle": "MantaNetwork"},
        {"name": "Immutable", "type": "L2", "has_grants": True, "type": "Gaming", "twitter_handle": "Immutable"},

        # TIER 3 — Cosmos Ecosystem & Others
        {"name": "Osmosis", "type": "DeFi", "has_grants": True, "twitter_handle": "osmosiszone"},
        {"name": "Injective", "type": "L1", "has_grants": True, "twitter_handle": "Injective_"},
        {"name": "Celestia", "type": "Infra", "has_grants": True, "twitter_handle": "CelestiaOrg"},
        {"name": "Sei", "type": "L1", "has_grants": True, "twitter_handle": "SeiNetwork"},
        {"name": "dYdX", "type": "DeFi", "has_grants": True, "twitter_handle": "dYdX"},
        {"name": "Noble", "type": "L1", "twitter_handle": "noble_xyz"},
        {"name": "Kujira", "type": "DeFi", "twitter_handle": "TeamKujira"},
        {"name": "Juno", "type": "L1", "has_grants": True, "twitter_handle": "JunoNetwork"},
        {"name": "Akash", "type": "Infra", "has_grants": True, "twitter_handle": "akashnet_"},
        {"name": "Persistence", "type": "L1", "twitter_handle": "PersistenceOne"},
        {"name": "Secret Network", "type": "L1", "has_grants": True, "twitter_handle": "SecretNetwork"},
        {"name": "Stride", "type": "DeFi", "twitter_handle": "stride_zone"},
        {"name": "Neutron", "type": "L1", "has_grants": True, "twitter_handle": "Neutron_org"},
        {"name": "Saga", "type": "L1", "has_grants": True, "twitter_handle": "Sagaxyz__"},
        {"name": "Archway", "type": "L1", "has_grants": True, "twitter_handle": "archwayHQ"},

        # Modular & Infra
        {"name": "EigenLayer", "type": "Infra", "has_grants": True, "twitter_handle": "eigenlayer"},
        {"name": "LayerZero", "type": "Infra", "has_grants": True, "twitter_handle": "LayerZero_Labs"},
        {"name": "Wormhole", "type": "Infra", "has_grants": True, "twitter_handle": "wormholecrypto"},
        {"name": "Chainlink", "type": "Infra", "has_grants": True, "twitter_handle": "chainlink"},
        {"name": "The Graph", "type": "Infra", "has_grants": True, "twitter_handle": "graphprotocol"},
        {"name": "Arweave", "type": "Infra", "has_grants": True, "twitter_handle": "ArweaveEco"},
        {"name": "Filecoin", "type": "Infra", "has_grants": True, "twitter_handle": "Filecoin"},
        
        # Emerging / High Signal
        {"name": "Berachain", "type": "L1", "has_hackathons": True, "twitter_handle": "berachain"},
        {"name": "Monad", "type": "L1", "has_hackathons": True, "twitter_handle": "monad_xyz"},
        {"name": "Hyperliquid", "type": "DeFi", "twitter_handle": "HyperliquidX"},
        {"name": "Aleo", "type": "L1", "has_grants": True, "twitter_handle": "AleoHQ"},
        {"name": "Mina", "type": "L1", "has_grants": True, "twitter_handle": "MinaProtocol"},
    ]
    
    count = 0
    for data in ecosystems_data:
        exists = db.query(Ecosystem).filter(Ecosystem.name == data["name"]).first()
        if not exists:
            eco = Ecosystem(**data)
            db.add(eco)
            count += 1
            print(f"Added Ecosystem: {data['name']}")
    
    db.commit()
    print(f"Successfully seeded {count} new ecosystems.")
    db.close()

if __name__ == "__main__":
    seed_ecosystems()
