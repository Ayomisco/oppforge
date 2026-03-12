import { sepolia } from 'wagmi/chains'

// Deployed on ETH Sepolia — verified on Etherscan
export const CONTRACTS = {
  PROTOCOL: {
    address: '0x502973c5413167834d49078f214ee777a8C0A8Cf',
    chainId: sepolia.id,
  },
  FOUNDER_NFT: {
    address: '0xa0928440186C28062c964aeE496b38275e94aA8c',
    chainId: sepolia.id,
  },
  MISSION: {
    address: '0x654b689f316c5E2D1c6860d2446A73538B146722',
    chainId: sepolia.id,
  },
}

// Minimal ABIs — only the functions we call from the frontend
export const PROTOCOL_ABI = [
  {
    inputs: [{ internalType: 'uint8', name: '_tier', type: 'uint8' }],
    name: 'upgradeTier',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    name: 'tierPrices',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userTiers',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const FOUNDER_NFT_ABI = [
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINT_PRICE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const MISSION_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: '_missionId', type: 'bytes32' }],
    name: 'fundMission',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

// Tier enum mapping (matches Solidity: enum Tier { NONE, HUNTER, FOUNDER })
export const TIER_ENUM = {
  NONE: 0,
  HUNTER: 1,
  FOUNDER: 2,
}
