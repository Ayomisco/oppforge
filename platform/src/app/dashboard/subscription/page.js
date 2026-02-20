'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWriteContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { Shield, Zap, Sparkles, Check, Crown, Clock, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';

// Pricing tiers
const TIERS = [
  {
    id: 'scout',
    name: 'Scout',
    tagline: 'Alpha Access',
    price: '$0',
    priceDetail: '14-Day Free Trial',
    ethPrice: '0',
    icon: Shield,
    description: 'Full platform access for 14 days. No credit card required.',
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
    price: '$2.9',
    priceDetail: '/month',
    ethPrice: '0.0012', // ~$2.9 in ETH
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
  {
    id: 'founder',
    name: 'Founder',
    tagline: 'For Teams & Power Users',
    price: '$6',
    priceDetail: '/month',
    ethPrice: '0.0025', // ~$6 in ETH
    icon: Crown,
    description: 'Maximum intelligence. Built for teams that ship.',
    features: [
      'Everything in Hunter',
      'Team Collaboration (3 seats)',
      'Custom Scraper Integration',
      'API Access (Coming Soon)',
      'On-Chain Reputation Badge',
      'Exclusive Alpha Calls',
      'White-Glove Onboarding',
    ],
    accent: '#D4AF37',
    bg: 'from-[#D4AF37]/8 to-transparent',
    border: 'border-[#D4AF37]/30',
  },
];

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [loadingTier, setLoadingTier] = useState(null);

  // Trial info
  const trialInfo = useMemo(() => {
    const trialStart = user?.trial_started_at ? new Date(user.trial_started_at) : (user?.created_at ? new Date(user.created_at) : new Date());
    const now = new Date();
    const daysUsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 14 - daysUsed);
    const isTrialing = (user?.subscription_status === 'trialing') && daysLeft > 0;
    const isExpired = (user?.subscription_status === 'trialing') && daysLeft <= 0;
    return { daysLeft, daysUsed, isTrialing, isExpired };
  }, [user]);

  const currentTier = user?.tier || 'scout';
  const isActive = user?.subscription_status === 'active' || user?.is_pro;

  const handleUpgrade = async (tier) => {
    if (tier.id === 'scout') return;
    
    if (!isConnected) {
      toast.error("Connect your wallet to subscribe with crypto.", { icon: '🔗' });
      return;
    }

    setLoadingTier(tier.id);
    const tid = toast.loading(`Initiating ${tier.name} upgrade...`);

    try {
      // 1. Direct wallet payment (simple transfer for now)
      // In production, replace with a proper payment contract or Helio/Sphere integration
      const PAYMENT_WALLET = '0x0000000000000000000000000000000000000001'; // Replace with your wallet
      
      await writeContractAsync({
        // Simple ETH transfer approach - can upgrade to contract later
        abi: [{
          "inputs": [],
          "name": "receive",
          "outputs": [],
          "stateMutability": "payable",
          "type": "receive"
        }],
        address: PAYMENT_WALLET,
        functionName: undefined,
        value: parseEther(tier.ethPrice)
      });

      // 2. Sync with backend
      const { data } = await api.put('/auth/profile', {
        tier: tier.id,
        is_pro: true,
        subscription_status: 'active'
      });

      setUser(data);
      toast.success(`You are now a ${tier.name}! Full access unlocked. 🔥`, { id: tid });
    } catch (error) {
      console.error("Upgrade failed:", error);
      // If user rejected or it failed, still allow manual override for demo
      toast.error("Transaction cancelled or failed.", { id: tid });
    } finally {
      setLoadingTier(null);
    }
  };

  // For "Demo Mode" - temporary bypass for testing
  const handleDemoUpgrade = async (tier) => {
    const tid = toast.loading(`Activating ${tier.name}...`);
    try {
      const { data } = await api.put('/auth/profile', {
        tier: tier.id,
        is_pro: true,
        subscription_status: 'active'
      });
      setUser(data);
      toast.success(`${tier.name} activated! (Demo mode)`, { id: tid });
    } catch (error) {
      toast.error("Upgrade failed.", { id: tid });
    }
  };

  const getButtonState = (tier) => {
    if (currentTier === tier.id && isActive) return { text: 'Current Plan', disabled: true, style: 'bg-white/5 text-gray-500 border border-white/10 cursor-default' };
    if (tier.id === 'scout') return { text: 'Free Trial', disabled: true, style: 'bg-white/5 text-gray-500 border border-white/10 cursor-default' };
    return { 
      text: `Subscribe · ${tier.price}/mo`, 
      disabled: false, 
      style: `bg-[${tier.accent}] text-white hover:brightness-110 shadow-[0_0_20px_${tier.accent}33]`
    };
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tighter">Choose Your Plan</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Start free for 14 days. Then pick the plan that fits your grind. Cancel anytime.
        </p>

        {/* Trial Status Banner */}
        {trialInfo.isTrialing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20"
          >
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#10b981] text-sm font-mono font-bold">{trialInfo.daysLeft} days left</span>
            <span className="text-gray-500 text-xs">on your Alpha Trial</span>
          </motion.div>
        )}

        {trialInfo.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20"
          >
            <Lock size={14} className="text-red-400" />
            <span className="text-red-400 text-sm font-bold">Trial Expired</span>
            <span className="text-gray-500 text-xs">— Upgrade below to continue</span>
          </motion.div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className={`relative p-8 rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.bg} flex flex-col gap-6 overflow-hidden group`}
            >
              {tier.popular && (
                <div className="absolute top-4 right-4 bg-[#ff5500] text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(255,85,0,0.4)]">
                  Best Value
                </div>
              )}

              {/* Tier Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${tier.accent}15` }}>
                    <TierIcon size={20} style={{ color: tier.accent }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: `${tier.accent}AA` }}>{tier.tagline}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2">
                  <span className="text-4xl font-black text-white tracking-tight">{tier.price}</span>
                  <span className="text-sm text-gray-500">{tier.priceDetail}</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 pt-2 border-t border-white/5">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-[12px] text-gray-300">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: tier.accent }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => tier.id !== 'scout' && handleDemoUpgrade(tier)}
                disabled={btn.disabled || loadingTier === tier.id}
                className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 ${
                  btn.disabled 
                    ? 'bg-white/5 text-gray-500 border border-white/10 cursor-default'
                    : tier.popular
                    ? 'bg-[#ff5500] text-white hover:bg-[#ff7700] shadow-[0_0_25px_rgba(255,85,0,0.3)]'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {loadingTier === tier.id ? 'Processing...' : btn.text}
              </button>

              {/* Crypto payment note */}
              {!btn.disabled && tier.id !== 'scout' && (
                <p className="text-[10px] text-gray-600 text-center font-mono">
                  Pay with ETH · ~{tier.ethPrice} ETH/mo
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

      {/* FAQ / Bottom Info */}
      <div className="pt-12 border-t border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-sm font-bold text-white mb-1">Cancel Anytime</div>
            <div className="text-xs text-gray-500">No lock-in. Downgrade to Scout whenever you want.</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-1">Crypto-Native Payments</div>
            <div className="text-xs text-gray-500">Pay with ETH directly from your wallet. On-chain proof.</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-1">14-Day Money Back</div>
            <div className="text-xs text-gray-500">Not satisfied? We'll refund your first month.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
