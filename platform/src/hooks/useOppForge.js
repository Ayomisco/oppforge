'use client'

import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { parseEther, encodePacked, keccak256 } from 'viem'

// These would be updated after deployment
export const MISSION_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FOUNDER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'

const MISSION_ABI = [
  {
    "inputs": [{"internalType": "bytes32", "name": "_missionId", "type": "bytes32"}],
    "name": "startMission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_hunter", "type": "address"}],
    "name": "getHunterStats",
    "outputs": [
      {"internalType": "uint256", "name": "reputation", "type": "uint256"},
      {"internalType": "uint256", "name": "earnings", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export function useOppForge() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const startMissionOnChain = async (missionId) => {
    // Convert UUID string to bytes32 (simple hash for demo)
    const bytesId = keccak256(encodePacked(['string'], [missionId]))
    
    return await writeContractAsync({
      address: MISSION_CONTRACT_ADDRESS,
      abi: MISSION_ABI,
      functionName: 'startMission',
      args: [bytesId],
    })
  }

  return {
    startMissionOnChain,
    address
  }
}
