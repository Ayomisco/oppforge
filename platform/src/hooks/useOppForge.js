'use client'

import { useWriteContract, useAccount } from 'wagmi'
import { encodePacked, keccak256 } from 'viem'
import { CONTRACTS, MISSION_ABI, PAYMENT_CHAIN } from '@/lib/contracts'

export function useOppForge() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const startMissionOnChain = async (missionId) => {
    const bytesId = keccak256(encodePacked(['string'], [missionId]))
    return await writeContractAsync({
      address: CONTRACTS.MISSION.address,
      abi: MISSION_ABI,
      functionName: 'startMission',
      args: [bytesId],
      chainId: PAYMENT_CHAIN.id,
    })
  }

  return { startMissionOnChain, address }
}
