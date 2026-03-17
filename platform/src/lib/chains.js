/**
 * Single source of truth for all blockchain chains used across OppForge.
 * Import from here everywhere — filters, onboarding, admin, settings, etc.
 */

export const CHAINS = [
  { id: 'aleo', label: 'Aleo' },
  { id: 'algorand', label: 'Algorand' },
  { id: 'aptos', label: 'Aptos' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'base', label: 'Base' },
  { id: 'berachain', label: 'Berachain' },
  { id: 'bitcoin', label: 'Bitcoin L2' },
  { id: 'blast', label: 'Blast' },
  { id: 'bsc', label: 'BSC' },
  { id: 'canto', label: 'Canto' },
  { id: 'cardano', label: 'Cardano' },
  { id: 'casper', label: 'Casper' },
  { id: 'celo', label: 'Celo' },
  { id: 'celestia', label: 'Celestia' },
  { id: 'cosmos', label: 'Cosmos' },
  { id: 'cronos', label: 'Cronos' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'fantom', label: 'Fantom' },
  { id: 'filecoin', label: 'Filecoin' },
  { id: 'flow', label: 'Flow' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'gnosis', label: 'Gnosis' },
  { id: 'harmony', label: 'Harmony' },
  { id: 'hedera', label: 'Hedera' },
  { id: 'immutablex', label: 'ImmutableX' },
  { id: 'injective', label: 'Injective' },
  { id: 'iotx', label: 'IoTeX' },
  { id: 'kava', label: 'Kava' },
  { id: 'linea', label: 'Linea' },
  { id: 'manta', label: 'Manta' },
  { id: 'mantle', label: 'Mantle' },
  { id: 'metis', label: 'Metis' },
  { id: 'mina', label: 'Mina' },
  { id: 'monad', label: 'Monad' },
  { id: 'moonbeam', label: 'Moonbeam' },
  { id: 'multiversx', label: 'MultiversX' },
  { id: 'near', label: 'NEAR' },
  { id: 'oasis', label: 'Oasis' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'polkadot', label: 'Polkadot' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'ronin', label: 'Ronin' },
  { id: 'scroll', label: 'Scroll' },
  { id: 'sei', label: 'Sei' },
  { id: 'solana', label: 'Solana' },
  { id: 'starknet', label: 'Starknet' },
  { id: 'sui', label: 'Sui' },
  { id: 'tezos', label: 'Tezos' },
  { id: 'ton', label: 'TON' },
  { id: 'tron', label: 'Tron' },
  { id: 'zksync', label: 'zkSync' },
  { id: 'zora', label: 'Zora' },
]

/** Chain list with "All Chains" and "Others" options — for filter dropdowns */
export const FILTER_CHAINS = [
  { id: 'all', label: 'All Chains' },
  ...CHAINS,
  { id: 'others', label: 'Others (Non-Chain)' },
]

/** Just labels sorted — for onboarding, settings, tag pickers */
export const CHAIN_LABELS = CHAINS.map(c => c.label)

/** Labels for admin create/edit — includes Multi-chain and Other */
export const ADMIN_CHAINS = ['Multi-chain', ...CHAIN_LABELS, 'Other']
