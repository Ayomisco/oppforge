'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useSwitchChain, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Shield, Zap, Sparkles, Check, Crown, Clock, ArrowRight, Lock, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';
import { CONTRACTS, PROTOCOL_ABI, TIER_ENUM, PAYMENT_CHAIN, PAYMENT_NETWORK, PAYMENT_NETWORK_LABEL } from '@/lib/contracts';

// Pricing tiers — matches OppForgeProtocol.sol
const TIERS = [
  {
    id: 'scout',
    name: 'Scout',
    tagline: 'Alpha Access',
    price: 'Free',
    priceDetail: '7-Day Trial',
    ethPrice: '0',
    icon: Shield,
    description: 'Full platform access for 7 days. No credit card required.',
    features: [
      'Full AI Analysis & Scoring',
      'Priority Alpha Feed',
      '5 Proposal Generations',
      'Risk Intelligence Shield',
      'Mission Tracking (5 slots)',
    ],
    accent: '#10b981',
    bg: 'from-[#10b981]/5 to-transparent',
    border: 'border-[#10b981]/20',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    tagline: 'Most Popular',
    price: '0.005 ETH',
    priceDetail: '/month (~$10)',
    ethPrice: '0.005',
    contractTier: TIER_ENUM.HUNTER,
    icon: Zap,
    description: 'Unlimited AI power for serious builders & hunters.',
    features: [
      'Everything in Scout',
      'Unlimited Proposal Generations',
      'Sub-5s Real-time Alpha Feed',
      'Advanced Deduplication Protocol',
      'Unlimited Mission Tracking',
      'Forge AI Chat (Unlimited)',
      'Priority Support',
    ],
    accent: '#ff5500',
    bg: 'from-[#ff5500]/8 to-transparent',
    border: 'border-[#ff5500]/30',
    popular: true,
  },
];

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const { isConnected, address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { connectors, connect } = useConnect();
  const [loadingTier, setLoadingTier] = useState(null);

  // Trial info
  const trialInfo = useMemo(() => {
    const trialStart = user?.trial_started_at ? new Date(user.trial_started_at) : (user?.created_at ? new Date(user.created_at) : new Date());
    const now = new Date();
    const daysUsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysUsed);
    const isTrialing = (user?.subscription_status === 'trialing') && daysLeft > 0;
    const isExpired = (user?.subscription_status === 'trialing') && daysLeft <= 0;
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
    return { daysLeft, daysUsed, isTrialing, isExpired, isAdmin };
  }, [user]);

  const currentTier = user?.tier === 'founder' ? 'hunter' : (user?.tier || 'scout');
  const isActive = user?.subscription_status === 'active' || user?.is_pro || trialInfo.isAdmin;

  const handleUpgrade = async (tier) => {
    if (tier.id === 'scout') return;
    
    if (!isConnected) {
      // Open wallet connect modal
      if (connectors.length > 0) {
        // Try to get MetaMask first
        const metaMask = connectors.find(c => c.name === 'MetaMask');
        const connector = metaMask || connectors[0];
        try {
          connect({ connector });
          toast.success('Wallet selector opened. Please connect your wallet.', { icon: '🔗' });
        } catch (error) {
          toast.error('Failed to open wallet selector', { icon: '❌' });
        }
      }
      return;
    }

    setLoadingTier(tier.id);
    const tid = toast.loading('Preparing transaction...');

    try {
      if (chainId !== PAYMENT_CHAIN.id) {
        toast.loading(`Switching to ${PAYMENT_NETWORK_LABEL}...`, { id: tid });
        await switchChainAsync({ chainId: PAYMENT_CHAIN.id });
      }

      toast.loading('Confirm transaction in your wallet...', { id: tid });

      // Call upgradeTier on OppForgeProtocol contract
      const hash = await writeContractAsync({
        address: CONTRACTS.PROTOCOL.address,
        abi: PROTOCOL_ABI,
        functionName: 'upgradeTier',
        args: [tier.contractTier],
        value: parseEther(tier.ethPrice),
        chainId: PAYMENT_CHAIN.id,
      });

      toast.loading('Verifying on-chain...', { id: tid });

      // Verify with backend
      const { data: updateResult } = await api.post('/billing/verify-payment', {
        tx_hash: hash,
        tier: tier.id,
        network: PAYMENT_NETWORK,
        amount: parseFloat(tier.ethPrice),
      });

      // Update local user state
      const { data: userData } = await api.get('/auth/me');
      setUser(userData);
      
      toast.success(`${tier.name} tier activated via smart contract!`, { id: tid });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Upgrade failed:', error);
      const msg = error?.shortMessage || error?.message || 'Transaction cancelled or failed.';
      toast.error(msg, { id: tid });
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonState = (tier) => {
    if (trialInfo.isAdmin) return { text: 'Admin Access', disabled: true, style: 'bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/30 cursor-default' };
    if (currentTier === tier.id && isActive) return { text: 'Current Plan', disabled: true, style: 'bg-white/5 text-gray-500 border border-white/10 cursor-default' };
    if (tier.id === 'scout') return { text: 'Free Trial', disabled: true, style: 'bg-white/5 text-gray-500 border border-white/10 cursor-default' };
    
    if (!isConnected) {
      return { 
        text: `Connect Wallet · ${tier.price}`,
        disabled: false, 
      };
    }
    
    return { 
      text: `Subscribe · ${tier.price}`,
      disabled: false, 
    };
  };

  return (
    <div className="min-h-screen py-8 md:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-tighter">CLEARANCE ACCESS</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto px-2">
          Elevate your intelligence platform. Secure your edge in the forge.
        </p>

        {/* Trial Status Banner */}
        {trialInfo.isAdmin ? (
           <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#ffaa00]/10 border border-[#ffaa00]/20 shadow-[0_0_20px_rgba(255,170,0,0.1)]"
         >
           <Crown size={14} className="text-[#ffaa00]" />
           <span className="text-[#ffaa00] text-sm font-mono font-bold uppercase tracking-widest">Administrator_Level_Unlocked</span>
         </motion.div>
        ) : trialInfo.isTrialing ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20"
          >
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#10b981] text-sm font-mono font-bold">{trialInfo.daysLeft} days left</span>
            <span className="text-gray-500 text-xs">on your Alpha Trial</span>
          </motion.div>
        ) : trialInfo.isExpired ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20"
          >
            <Lock size={14} className="text-red-400" />
            <span className="text-red-400 text-sm font-bold">Protocol Access Expired</span>
            <span className="text-gray-500 text-xs">— Upgrade below to restore intelligence feed</span>
          </motion.div>
        ) : null}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {TIERS.map((tier, idx) => {
          const btn = getButtonState(tier);
          const TierIcon = tier.icon;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative p-8 lg:p-10 rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.bg} flex flex-col gap-6 overflow-hidden group ${tier.popular ? 'md:scale-105 md:col-span-1' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-4 right-4 bg-[#ff5500] text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(255,85,0,0.4)]">
                  Elite_Pick
                </div>
              )}

              {/* Tier Header */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${tier.accent}15` }}>
                    <TierIcon size={20} style={{ color: tier.accent }} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">{tier.name}</h3>
                    <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-wider" style={{ color: `${tier.accent}AA` }}>{tier.tagline}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 md:gap-1.5 pt-2">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tight">{tier.price}</span>
                  <span className="text-xs md:text-sm text-gray-500">{tier.priceDetail}</span>
                </div>
                <p className="text-[11px] md:text-[12px] text-gray-400 leading-relaxed font-mono">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2 md:space-y-3 pt-2 md:pt-4 border-t border-white/5">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 md:gap-3 text-[11px] md:text-[12px] text-gray-400">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: tier.accent }} />
                    <span className="font-mono">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(tier)}
                disabled={btn.disabled || loadingTier === tier.id}
                className={`w-full py-3 md:py-4 px-4 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 ${
                  btn.disabled 
                    ? btn.style
                    : tier.popular
                    ? 'bg-[#ff5500] text-white hover:bg-[#ff7700] shadow-[0_0_25px_rgba(255,85,0,0.3)]'
                    : 'bg-white/[0.03] text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {loadingTier === tier.id ? 'VERIFYING_TX...' : btn.text}
              </button>

              {/* Crypto payment note */}
              {!btn.disabled && tier.id !== 'scout' && (
                <p className="text-[9px] md:text-[10px] text-gray-600 text-center font-mono">
                  NETWORK: {PAYMENT_NETWORK_LABEL} · {tier.ethPrice} ETH via Smart Contract
                </p>
              )}

              {/* Background decoration */}
              <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <TierIcon size={140} style={{ color: tier.accent }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust bar */}
      <div className="pt-8 md:pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center bg-[#050403]/50 p-6 md:p-8 rounded-2xl">
          <div>
            <div className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 uppercase tracking-tighter">On-Chain Privacy</div>
            <div className="text-[10px] md:text-[11px] text-gray-600 font-mono">Anonymous wallet-based payments. No KYC.</div>
          </div>
          <div>
            <div className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 uppercase tracking-tighter">Instant Clearance</div>
            <div className="text-[10px] md:text-[11px] text-gray-600 font-mono">Confirmed after 1 block confirmation.</div>
          </div>
          <div>
            <div className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 uppercase tracking-tighter">The Builder Edge</div>
            <div className="text-[10px] md:text-[11px] text-gray-600 font-mono">AI signals optimized for maximizing yield.</div>
          </div>
      </div>
    </div>
  );
}
