'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { Shield, Zap, Sparkles, Check, ChevronRight, Lock, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ABI for Protocol Upgrades
const PROTOCOL_ABI = [
  {
    "inputs": [{"internalType": "uint8", "name": "_tier", "type": "uint8"}],
    "name": "upgradeTier",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Deploy and fill

const TIERS = [
  {
    id: 'scout',
    name: 'Scout',
    rank: 0,
    price: '0',
    description: 'Entry-level access for mission scouting.',
    features: ['Basic AI Analysis', 'Public Feed Access', '5 Active Tracking Slots'],
    accent: 'gray-500',
    bg: 'bg-gray-500/5',
    border: 'border-white/10'
  },
  {
    id: 'hunter',
    name: 'Legendary Hunter',
    rank: 1,
    price: '0.05',
    description: 'High-octane tools for serious alpha extraction.',
    features: ['Advanced AI Refining', 'Private Signal Feed', 'Unlimited Mission Tracking', 'Priority Forge Access'],
    accent: '#ff5500',
    bg: 'bg-[#ff5500]/5',
    border: 'border-[#ff5500]/30',
    popular: true
  },
  {
    id: 'founder',
    name: 'The Founder',
    rank: 2,
    price: '0.2',
    description: 'Lifetime governance and ultimate utility.',
    features: ['Lifetime Pro Access', 'On-Chain Credentials', 'Direct Mission Funding', 'Exclusive Governance Rights'],
    accent: '#ffaa00',
    bg: 'bg-[#ffaa00]/5',
    border: 'border-[#ffaa00]/30'
  }
];

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [loadingTier, setLoadingTier] = useState(null);

  const handleUpgrade = async (tier) => {
    if (!isConnected) {
        toast.error("Connect your Web3 Identity first.");
        return;
    }

    setLoadingTier(tier.id);
    const tid = toast.loading(`Upgrading Protocol to ${tier.name}...`);
    
    try {
        // 1. Blockchain Transaction
        await writeContractAsync({
            address: CONTRACT_ADDRESS,
            abi: PROTOCOL_ABI,
            functionName: 'upgradeTier',
            args: [tier.rank],
            value: parseEther(tier.price)
        });

        // 2. Sync with Backend
        const { data } = await api.put('/auth/profile', { 
            tier: tier.id,
            is_pro: true 
        });
        
        setUser(data);
        toast.success(`Protocol Reforge Complete: You are now a ${tier.name}!`, { id: tid });
    } catch (error) {
        console.error("Upgrade failed:", error);
        toast.error("Protocol Upgrade Interrupted.", { id: tid });
    } finally {
        setLoadingTier(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">Protocol Tiers</h1>
        <p className="text-gray-500 font-mono text-sm max-w-2xl mx-auto uppercase tracking-widest">
            Upgrade your clearing level to unlock advanced AI capabilities and on-chain reputation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier) => (
          <motion.div 
            key={tier.id}
            whileHover={{ y: -5 }}
            className={`relative p-8 rounded-2xl border ${tier.border} ${tier.bg} flex flex-col gap-6 overflow-hidden group`}
          >
            {tier.popular && (
              <div className="absolute top-4 right-4 bg-[#ff5500] text-black text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase shadow-[0_0_15px_#ff5500]">
                Most Alpha
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {tier.rank === 2 ? <Crown className="text-[#ffaa00]" size={18} /> : 
                 tier.rank === 1 ? <Zap className="text-[#ff5500]" size={18} /> : 
                 <Shield className="text-gray-500" size={18} />}
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{tier.price}</span>
                <span className="text-xs font-mono text-gray-500">ETH {tier.id === 'founder' ? '/ Once' : tier.id === 'scout' ? '' : '/ Month'}</span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono uppercase tracking-tight h-8">{tier.description}</p>
            </div>

            <div className="flex-1 space-y-3">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <Check size={12} className="text-[#00fa9a]" />
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(tier)}
              disabled={user?.tier === tier.id || tier.id === 'scout' || loadingTier === tier.id}
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all
                ${user?.tier === tier.id 
                  ? 'bg-white/5 text-gray-500 cursor-default border border-white/5' 
                  : tier.id === 'scout' 
                  ? 'bg-white/5 text-gray-500 cursor-default border border-white/5'
                  : 'bg-[#ff5500] text-white hover:bg-[#ff7700] shadow-[0_0_20px_rgba(255,85,0,0.2)] hover:shadow-[0_0_30px_rgba(255,85,0,0.4)]'}
                disabled:opacity-50
              `}
            >
              {loadingTier === tier.id ? 'Reforging...' : user?.tier === tier.id ? 'Active Level' : tier.id === 'scout' ? 'Base Protocol' : `Upgrade to ${tier.name}`}
            </button>
            
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Sparkles size={120} style={{ color: tier.accent }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Quote / Bottom Info */}
      <div className="pt-12 border-t border-white/5 text-center space-y-6">
         <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="font-mono text-[10px] text-gray-400">SECURE_BY_ARBITRUM</div>
            <div className="font-mono text-[10px] text-gray-400">AES_256_ENCRYPTION</div>
            <div className="font-mono text-[10px] text-gray-400">ALPHA_VETTED_SYSTEM</div>
         </div>
      </div>
    </div>
  );
}
