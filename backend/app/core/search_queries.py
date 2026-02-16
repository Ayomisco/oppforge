# Extensive list of search queries for Web3 opportunities
# Categorized for rotation

ECOSYSTEMS = [
    "Solana", "Ethereum", "Arbitrum", "Optimism", "Polygon", 
    "Base", "Sui", "Aptos", "Berachain", "Monad", "Starknet", 
    "ZkSync", "Avalanche", "Cosmos", "Celestia"
]

KEYWORDS = [
    "Hackathon", "Grant", "Bounty", "Accelerator", "Incubator", 
    "Testnet", "Airdrop", "Validator", "Retroactive Funding", 
    "Public Goods", "Developer Incentive", "Bug Bounty"
]

# High-signal phrases (Layer 3 Social Signal)
SOCIAL_PHRASES = [
    "testnet is live",
    "ambassador program",
    "ecosystem fund",
    "retroactive grant",
    "bug bounty",
    "validator incentive",
    "creator fund",
    "community contributor",
    "apply now",
    "submit proposal",
    "grants program live",
    "hackathon registration",
    "build on",
    "mainnet launch",
    "incentivized testnet",
    "call for builders",
    "rfp", 
    "request for proposal",
    "quadratic funding",
    "gitcoin round"
]

def get_search_queries():
    """Generates a list of 50-100+ combined queries."""
    queries = []
    
    # 1. Broad Ecosystem + Keyword combos
    for eco in ECOSYSTEMS:
        for kw in ["Grant", "Hackathon", "Bounty"]:
            queries.append(f"{eco} {kw}")
            
    # 2. Specific Signal Phrases
    queries.extend(SOCIAL_PHRASES)
    
    # 3. Specific High-Value Combos
    queries.append("Web3 Grants")
    queries.append("Crypto Internships")
    queries.append("Blockchain Fellowship")
    queries.append("Zero Knowledge Grants")
    queries.append("DeFi Hackathon")
    queries.append("DePIN Grant")
    
    return list(set(queries)) # Dedup
