'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWriteContract, useAccount, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { Shield, Zap, Check, Crown, Clock, Lock, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { NETWORK_CONFIG, PROTOCOL_ABI, TIER_ENUM } from '@/lib/contracts';

const PAYMENT_NETWORKS = [
  { key: 'arbitrum', icon: '🔷', name: 'Arbitrum' },
  { key: 'celo',     icon: '🟡', name: 'Celo' },
]

const TIER_FEATURES = {
  scout: [
    'Full AI Analysis & Scoring',
    'Priority Alpha Feed',
    '5 Proposal Generations',
    'Risk Intelligence Shield',
    'Mission Tracking (5 slots)',
  ],
  hunter: [
    'Everything in Scout',
    'Unlimited Proposal Generations',
    'Sub-5s Real-time Alpha Feed',
    'Advanced Deduplication Protocol',
    'Unlimited Mission Tracking',
    'Forge AI Chat (Unlimited)',
    'Priority Support',
  ],
}

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const { isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const [loadingTier, setLoadingTier] = useState(null);
  const [payNetwork, setPayNetwork] = useState('arbitrum');

  const net = NETWORK_CONFIG[payNetwork];

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

  const handleUpgrade = async () => {
    // Step 1: Connect wallet if not connected — opens RainbowKit modal inline
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    setLoadingTier('hunter');
    const tid = toast.loading('Preparing transaction...');

    try {
      // Step 2: Switch to correct chain if needed
      if (chainId !== net.chain.id) {
        toast.loading(`Switching to ${net.label}...`, { id: tid });
        await switchChainAsync({ chainId: net.chain.id });
      }

      toast.loading('Confirm transaction in your wallet...', { id: tid });

      const hash = await writeContractAsync({
        address: net.protocol,
        abi: PROTOCOL_ABI,
        functionName: 'upgradeTier',
        args: [TIER_ENUM.HUNTER],
        value: parseEther(net.hunterPrice),
        chainId: net.chain.id,
      });

      toast.loading('Verifying on-chain...', { id: tid });

      await api.post('/billing/verify-payment', {
        tx_hash: hash,
        tier: 'hunter',
        network: payNetwork,
        amount: parseFloat(net.hunterPrice),
      });

      const { data: userData } = await api.get('/auth/me');
      setUser(userData);

      toast.success(`Hunter tier activated on ${net.label}!`, { id: tid });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Upgrade failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Transaction cancelled or failed.', { id: tid });
    } finally {
      setLoadingTier(null);
    }
  };

  const isHunterActive = currentTier === 'hunter' && isActive;

  return (
    <div className="min-h-screen py-8 md:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tighter">CLEARANCE ACCESS</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto px-2">
          Elevate your intelligence platform. Secure your edge in the forge.
        </p>

        {/* Trial/Status Banner */}
        {trialInfo.isAdmin ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#ffaa00]/10 border border-[#ffaa00]/20">
            <Crown size={14} className="text-[#ffaa00]" />
            <span className="text-[#ffaa00] text-sm font-mono font-bold uppercase tracking-widest">Administrator_Level_Unlocked</span>
          </motion.div>
        ) : trialInfo.isTrialing ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#10b981] text-sm font-mono font-bold">{trialInfo.daysLeft} days left</span>
            <span className="text-gray-500 text-xs">on your Alpha Trial</span>
          </motion.div>
        ) : trialInfo.isExpired ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20">
            <Lock size={14} className="text-red-400" />
            <span className="text-red-400 text-sm font-bold">Protocol Access Expired</span>
            <span className="text-gray-500 text-xs">— Upgrade below to restore intelligence feed</span>
          </motion.div>
        ) : null}
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Network Selector — shown only for the Hunter upgrade action */}
        {!isHunterActive && !trialInfo.isAdmin && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select Payment Network</p>
            <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10">
              {PAYMENT_NETWORKS.map(n => (
                <button
                  key={n.key}
                  onClick={() => setPayNetwork(n.key)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    payNetwork === n.key
                      ? 'bg-[#ff5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.3)]'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{n.icon}</span> {n.name}
                </button>
              ))}
            </div>
            <p className="text-[9px] font-mono text-gray-600">
              Hunter price: <span className="text-gray-400 font-bold">{net.hunterDisplay}</span> (~$10/month) on {net.label}
            </p>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Scout — Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="relative p-8 lg:p-10 rounded-2xl border border-[#10b981]/20 bg-gradient-to-b from-[#10b981]/5 to-transparent flex flex-col gap-6 overflow-hidden group"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#10b981]/15">
                  <Shield size={20} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Scout</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#10b981]/70">Alpha Access</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-black text-white">Free</span>
                <span className="text-sm text-gray-500">7-Day Trial</span>
              </div>
              <p className="text-[12px] text-gray-400 font-mono">Full platform access for 7 days. No credit card required.</p>
            </div>

            <div className="flex-1 space-y-3 pt-4 border-t border-white/5">
              {TIER_FEATURES.scout.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-[12px] text-gray-400">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#10b981]" />
                  <span className="font-mono">{f}</span>
                </div>
              ))}
            </div>

            <button disabled className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 text-gray-500 border border-white/10 cursor-default">
              {currentTier === 'scout' && isActive ? 'Current Plan' : 'Free Trial'}
            </button>

            <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
              <Shield size={140} className="text-[#10b981]" />
            </div>
          </motion.div>

          {/* Hunter — Paid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative p-8 lg:p-10 rounded-2xl border border-[#ff5500]/30 bg-gradient-to-b from-[#ff5500]/8 to-transparent flex flex-col gap-6 overflow-hidden group md:scale-105"
          >
            <div className="absolute top-4 right-4 bg-[#ff5500] text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(255,85,0,0.4)]">
              Elite_Pick
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#ff5500]/15">
                  <Zap size={20} className="text-[#ff5500]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Hunter</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff5500]/70">Most Popular</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-black text-white tracking-tighter">
                  {isHunterActive ? 'Active' : net.hunterDisplay}
                </span>
                {!isHunterActive && <span className="text-sm text-gray-500">/month</span>}
              </div>
              <p className="text-[12px] text-gray-400 font-mono">Unlimited AI power for serious builders &amp; hunters.</p>
            </div>

            <div className="flex-1 space-y-3 pt-4 border-t border-white/5">
              {TIER_FEATURES.hunter.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-[12px] text-gray-400">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#ff5500]" />
                  <span className="font-mono">{f}</span>
                </div>
              ))}
            </div>

            {trialInfo.isAdmin ? (
              <button disabled className="w-full py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/30 cursor-default">
                Admin Access
              </button>
            ) : isHunterActive ? (
              <button disabled className="w-full py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 text-gray-500 border border-white/10 cursor-default">
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loadingTier === 'hunter'}
                className="w-full py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-[#ff5500] text-white hover:bg-[#ff7700] shadow-[0_0_25px_rgba(255,85,0,0.3)] disabled:opacity-60"
              >
                {loadingTier === 'hunter'
                  ? 'VERIFYING_TX...'
                  : !isConnected
                  ? `Connect Wallet · ${net.hunterDisplay}`
                  : `Subscribe · ${net.hunterDisplay}`}
              </button>
            )}

            {!isHunterActive && !trialInfo.isAdmin && (
              <p className="text-[9px] text-gray-600 text-center font-mono">
                NETWORK: {net.label} · {net.hunterDisplay} via Smart Contract
              </p>
            )}

            <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
              <Zap size={140} className="text-[#ff5500]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="max-w-4xl mx-auto pt-8 md:pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-[#050403]/50 p-6 md:p-8 rounded-2xl">
        <div>
          <div className="text-xs font-bold text-white mb-2 uppercase tracking-tighter">On-Chain Privacy</div>
          <div className="text-[10px] text-gray-600 font-mono">Anonymous wallet-based payments. No KYC.</div>
        </div>
        <div>
          <div className="text-xs font-bold text-white mb-2 uppercase tracking-tighter">Instant Clearance</div>
          <div className="text-[10px] text-gray-600 font-mono">Confirmed after 1 block confirmation.</div>
        </div>
        <div>
          <div className="text-xs font-bold text-white mb-2 uppercase tracking-tighter">Multi-Chain</div>
          <div className="text-[10px] text-gray-600 font-mono">Pay with ETH on Arbitrum or CELO. Your choice.</div>
        </div>
      </div>
    </div>
  );
}
