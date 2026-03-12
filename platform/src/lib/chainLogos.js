/**
 * Chain logo URLs (using publicly available logos from crypto CDNs).
 * Falls back to a generic blockchain icon if chain is unknown.
 */

const CHAIN_LOGOS = {
  // Major L1s
  'ethereum':   'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'eth':        'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'bitcoin':    'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'solana':     'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'sol':        'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'avalanche':  'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  'avax':       'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  'polygon':    'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  'matic':      'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  'bnb':        'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  'bnb chain':  'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  'bsc':        'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  'cosmos':     'https://cryptologos.cc/logos/cosmos-atom-logo.svg',
  'atom':       'https://cryptologos.cc/logos/cosmos-atom-logo.svg',
  'near':       'https://cryptologos.cc/logos/near-protocol-near-logo.svg',
  'sui':        'https://cryptologos.cc/logos/sui-sui-logo.svg',
  'aptos':      'https://cryptologos.cc/logos/aptos-apt-logo.svg',
  'ton':        'https://cryptologos.cc/logos/toncoin-ton-logo.svg',
  'toncoin':    'https://cryptologos.cc/logos/toncoin-ton-logo.svg',
  'cardano':    'https://cryptologos.cc/logos/cardano-ada-logo.svg',
  'ada':        'https://cryptologos.cc/logos/cardano-ada-logo.svg',
  'polkadot':   'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg',
  'dot':        'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg',
  
  // L2s & Side-chains
  'arbitrum':   'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
  'arb':        'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
  'optimism':   'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
  'op':         'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
  'base':       'https://raw.githubusercontent.com/base-org/brand-kit/refs/heads/main/logo/symbol/Base_Symbol_Blue.svg',
  'zksync':     'https://cryptologos.cc/logos/zksync-zk-logo.svg',
  'starknet':   'https://cryptologos.cc/logos/starknet-token-strk-logo.svg',
  'mantle':     'https://cryptologos.cc/logos/mantle-mnt-logo.svg',
  'linea':      'https://cryptologos.cc/logos/linea-linea-logo.svg',
  'scroll':     'https://cryptologos.cc/logos/scroll-scr-logo.svg',
  'zora':       'https://cryptologos.cc/logos/zora-zora-logo.svg',

  // Platforms & Ecosystems
  'gnosis':     'https://cryptologos.cc/logos/gnosis-gno-gno-logo.svg',
  'fantom':     'https://cryptologos.cc/logos/fantom-ftm-logo.svg',
  'celo':       'https://cryptologos.cc/logos/celo-celo-logo.svg',
  'harmony':    'https://cryptologos.cc/logos/harmony-one-logo.svg',
  'moonbeam':   'https://cryptologos.cc/logos/moonbeam-glmr-logo.svg',
  'hedera':     'https://cryptologos.cc/logos/hedera-hbar-logo.svg',
  'algorand':   'https://cryptologos.cc/logos/algorand-algo-logo.svg',
  'tezos':      'https://cryptologos.cc/logos/tezos-xtz-logo.svg',
  'flow':       'https://cryptologos.cc/logos/flow-flow-logo.svg',
}

/**
 * Get chain logo URL from chain name. Falls back to null if unknown.
 * @param {string} chain - e.g. "Ethereum", "Solana", "Arbitrum"
 * @returns {string|null}
 */
export function getChainLogo(chain) {
  if (!chain) return null
  const key = chain.toLowerCase().trim()
  // Direct match
  if (CHAIN_LOGOS[key]) return CHAIN_LOGOS[key]
  // Partial match (e.g. "Ethereum Mainnet" → "ethereum")
  for (const [k, v] of Object.entries(CHAIN_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return null
}

/**
 * Get the best available image for an opportunity.
 * Priority: logo_url → chain logo → null
 */
export function getOppImage(opp) {
  if (opp?.logo_url) return opp.logo_url
  return getChainLogo(opp?.chain)
}
