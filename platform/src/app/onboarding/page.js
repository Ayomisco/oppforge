'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ChevronRight, Check, Hammer, Globe, Search, User,
  FileText, X, Hash, Rocket, Wallet, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 'identity',
    icon: User,
    title: 'Set Your Identity',
    subtitle: 'Tell us who you are in the ecosystem',
    color: '#ff5500',
  },
  {
    id: 'wallet',
    icon: Wallet,
    title: 'Connect Your Wallet',
    subtitle: 'Link your Web3 identity for on-chain matching',
    color: '#ffaa00',
  },
  {
    id: 'specialization',
    icon: Hammer,
    title: 'Your Superpowers',
    subtitle: 'What skills define you?',
    color: '#22d3ee',
  },
  {
    id: 'ecosystems',
    icon: Globe,
    title: 'Your Ecosystems',
    subtitle: 'Which chains and protocols do you build on?',
    color: '#a78bfa',
  },
];

const SKILLS = [
  'Smart Contracts', 'Frontend', 'Backend', 'DeFi', 'Protocols', 'Security',
  'Marketing', 'Content', 'DAO Ops', 'Rust', 'Solidity', 'Zero Knowledge',
  'Governance', 'Tokenomics', 'Community', 'Design', 'Research', 'DevRel',
  'Auditing', 'TypeScript', 'Python', 'Move', 'Vyper', 'Cairo', 'NFTs',
];

const ECOSYSTEMS = [
  'Solana', 'Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'Monad',
  'Berachain', 'Avalanche', 'Sui', 'Aptos', 'Near', 'Cosmos', 'Polkadot',
  'Celestia', 'Starknet', 'zkSync', 'Linea', 'Scroll', 'Blast', 'Sei',
  'Injective', 'Algorand', 'Cardano', 'Hedera', 'Celo', 'EigenLayer',
  'Hyperliquid', 'Jupiter', 'Wormhole', 'LayerZero', 'Lido', 'Aave',
  'Uniswap', 'Compound', 'GMX', 'dYdX', 'Drift', 'Orca', 'Raydium',
  'Lens Protocol', 'Farcaster', 'Zora', 'Blur', 'OpenSea', 'Magic Eden',
].sort();

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ fullName: '', bio: '', username: '' });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedChains, setSelectedChains] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, setUser, loading } = useAuth();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Guard: skip onboarding for already-onboarded or admin users
  useEffect(() => {
    if (!loading && user) {
      const isAdmin = (user.role || '').toLowerCase() === 'admin';
      if (user.onboarded === true || isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Pre-fill from Google account
  useEffect(() => {
    if (user && !formData.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        username: user.username || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isConnected) {
      toast.success('Wallet synced!', {
        icon: '🔗',
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,85,0,0.2)', fontFamily: 'monospace', fontSize: '12px' },
      });
    }
  }, [isConnected]);

  const StepIcon = steps[currentStep].icon;
  const stepColor = steps[currentStep].color;

  const filteredItems = useMemo(() => {
    const list = currentStep === 2 ? SKILLS : ECOSYSTEMS;
    return list.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentStep, searchQuery]);

  const toggleItem = (item, list, setList) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleNext = () => {
    if (currentStep === 0 && !formData.fullName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
      setSearchQuery('');
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Forging your identity...');
    try {
      const { data } = await api.put('/auth/profile', {
        full_name: formData.fullName,
        bio: formData.bio,
        username: formData.username || user?.username,
        skills: selectedSkills,
        preferred_chains: selectedChains,
        wallet_address: address,
        is_pro: false,
        onboarded: true,
      });
      setUser(data);
      toast.success('Identity forged! Welcome to Mission Control.', { id: toastId });
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save preferences.', { id: toastId });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050403] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Zap size={40} className="text-[#ff5500]" />
        </motion.div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentSelected = currentStep === 2 ? selectedSkills : selectedChains;
  const currentSetSelected = currentStep === 2 ? setSelectedSkills : setSelectedChains;

  return (
    <div className="min-h-screen bg-[#050403] flex items-center justify-center relative overflow-hidden p-4">

      {/* ── Ambient orbs ── */}
      <motion.div
        style={{ background: `radial-gradient(circle, ${stepColor}18 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[80px] pointer-events-none transition-all duration-1000"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] bg-[#ffaa00]/10 rounded-full blur-[100px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,85,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,85,0,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">

        {/* ── Top: Logo + step text ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OppForge" className="w-7 h-7 object-contain" />
            <span className="text-white font-bold tracking-tight">OppForge</span>
          </div>
          <div className="text-xs font-mono text-gray-600 tracking-widest uppercase">
            Step {currentStep + 1} of {steps.length}
          </div>
        </motion.div>

        {/* ── Step progress pills ── */}
        <div className="flex gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex-1 flex flex-col gap-1.5">
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{ background: i <= currentStep ? stepColor : 'rgba(255,255,255,0.06)' }}
              />
              <span
                className="text-[9px] font-mono uppercase tracking-widest transition-colors duration-300"
                style={{ color: i <= currentStep ? stepColor : '#374151' }}
              >
                {step.id}
              </span>
            </div>
          ))}
        </div>

        {/* ── Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-[#0c0a08]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.07] overflow-hidden"
            style={{ boxShadow: `0 0 80px ${stepColor}10` }}
          >
            {/* Card top accent */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${stepColor}80, transparent)` }} />

            <div className="p-8 lg:p-10">
              {/* Step header */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${stepColor}18`, border: `1px solid ${stepColor}30` }}
                >
                  <StepIcon size={22} style={{ color: stepColor }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">{steps[currentStep].title}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">{steps[currentStep].subtitle}</p>
                </div>
              </div>

              {/* ─── Step 0: Identity ─── */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  {[
                    { field: 'username', label: 'Forge Username', placeholder: 'e.g. satoshi_scout', icon: Hash, hint: 'Your unique handle on OppForge' },
                    { field: 'fullName', label: 'Display Name', placeholder: 'e.g. Satoshi Nakamoto', icon: User, hint: 'Auto-filled from your Google account' },
                  ].map(({ field, label, placeholder, icon: Icon, hint }) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">{label}</label>
                      <div className="relative">
                        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={formData[field]}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-700 focus:border-[#ff5500]/60 focus:outline-none focus:ring-1 focus:ring-[#ff5500]/20 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-gray-700">{hint}</p>
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Professional Bio</label>
                    <div className="relative">
                      <FileText size={15} className="absolute left-4 top-4 text-gray-600" />
                      <textarea
                        placeholder="What do you build in Web3? What's your focus?"
                        rows={3}
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-700 focus:border-[#ff5500]/60 focus:outline-none focus:ring-1 focus:ring-[#ff5500]/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Step 1: Wallet ─── */}
              {currentStep === 1 && (
                <div className="flex flex-col items-center gap-6 py-4">
                  <motion.div
                    animate={isConnected
                      ? { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }
                      : { y: [0, -8, 0] }
                    }
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div
                      className="w-28 h-28 rounded-3xl flex items-center justify-center"
                      style={{
                        background: isConnected ? 'rgba(34,197,94,0.1)' : 'rgba(255,85,0,0.08)',
                        border: `2px solid ${isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(255,85,0,0.2)'}`,
                        boxShadow: isConnected ? '0 0 40px rgba(34,197,94,0.2)' : '0 0 40px rgba(255,85,0,0.15)',
                      }}
                    >
                      <img src="/logo.png" alt="OppForge" className="w-16 h-16 object-contain" />
                    </div>
                    {isConnected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#050403]"
                      >
                        <Check size={14} className="text-black" />
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="text-center">
                    <p className="text-white font-medium mb-1">
                      {isConnected ? 'Wallet Connected!' : 'Connect Your Wallet'}
                    </p>
                    <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                      {isConnected
                        ? 'Your on-chain identity is synced. Our AI will analyze contributions and tailor opportunity matches.'
                        : 'Connecting allows our AI to analyze your on-chain activity and surface the most relevant opportunities.'}
                    </p>
                  </div>

                  <ConnectButton />

                  <p className="text-xs text-gray-700 text-center max-w-xs">
                    Optional but recommended. You can always connect later from Settings.
                  </p>
                </div>
              )}

              {/* ─── Step 2 & 3: Multi-select grids ─── */}
              {(currentStep === 2 || currentStep === 3) && (
                <div className="space-y-5">
                  {/* Selected tags */}
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    <AnimatePresence>
                      {currentSelected.map(item => (
                        <motion.span
                          key={item}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          onClick={() => toggleItem(item, currentSelected, currentSetSelected)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:opacity-80"
                          style={{ background: stepColor, color: '#000' }}
                        >
                          {item}
                          <X size={10} />
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {currentSelected.length === 0 && (
                      <span className="text-xs text-gray-700 italic">
                        Select at least one {currentStep === 2 ? 'skill' : 'ecosystem'}...
                      </span>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="text"
                      placeholder={`Search ${currentStep === 2 ? 'skills' : 'ecosystems'}...`}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl py-2.5 pl-11 pr-4 text-white text-sm placeholder-gray-700 focus:border-[#ff5500]/50 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1 space-y-0"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a1512 transparent' }}
                  >
                    {filteredItems.map(item => {
                      const isSelected = currentSelected.includes(item);
                      return (
                        <motion.button
                          key={item}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleItem(item, currentSelected, currentSetSelected)}
                          className="p-2.5 rounded-xl border text-left flex items-center gap-2 overflow-hidden transition-all duration-200 text-[12px]"
                          style={{
                            border: isSelected ? `1px solid ${stepColor}60` : '1px solid rgba(255,255,255,0.06)',
                            background: isSelected ? `${stepColor}12` : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#fff' : '#6b7280',
                          }}
                        >
                          {isSelected
                            ? <Check size={11} style={{ color: stepColor, shrink: 0 }} />
                            : (currentStep === 2 ? <Hammer size={11} /> : <Globe size={11} />)
                          }
                          <span className="truncate">{item}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-gray-700">
                    {currentSelected.length} selected · Used by AI to rank opportunities most relevant to you
                  </p>
                </div>
              )}

              {/* ── Navigation footer ── */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.05]">
                <div>
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(s => s - 1)}
                      className="px-5 py-2.5 text-sm text-gray-500 hover:text-white transition-colors font-medium"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress indicator */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-1 w-28 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${stepColor}, #ffaa00)` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{Math.round(progress)}%</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${stepColor}, #ffaa00)`, boxShadow: `0 0 25px ${stepColor}40` }}
                  >
                    {submitting ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                          <Zap size={16} />
                        </motion.div>
                        Forging...
                      </>
                    ) : currentStep === steps.length - 1 ? (
                      <><Rocket size={16} /> Launch Mission Control</>
                    ) : (
                      <>Continue <ChevronRight size={16} /></>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom note */}
        <p className="text-center mt-6 text-[10px] text-gray-800 font-mono tracking-[0.2em] uppercase">
          AGENTIC_PROTOCOL // ONBOARDING_SEQUENCE · {steps[currentStep].id.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
