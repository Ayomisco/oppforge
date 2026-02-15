'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Check, Hammer, Globe, Search, User, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { id: 'identity', title: 'Forge Identity', subtitle: 'Who are you in the forge?' },
  { id: 'wallet', title: 'Power Up', subtitle: 'Connect your Web3 identity' },
  { id: 'specialization', title: 'Specialize', subtitle: 'What are your core strengths?' },
  { id: 'ecosystems', title: 'Ecosystems', subtitle: 'Which networks do you forge on?' }
];

const SKILLS = [
  "Smart Contracts", "Frontend", "Backend", "DeFi", "Protocols", "Security", "Marketing", "Content", "DAO Ops",
  "Rust", "Solidity", "Zero Knowledge", "Governance", "Tokenomics", "Community", "Design", "Research"
];

const ECOSYSTEMS = [
  "Solana", "Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Monad", "Berachain", "Avalanche", "Sui", 
  "Aptos", "Near", "Cosmos", "Polkadot", "Celestia", "Starknet", "zkSync", "Linea", "Mantle", "Scroll", 
  "Ronin", "Blast", "Sei", "Injective", "Thorchain", "Algorand", "Cardano", "Hedera", "Gnosis", "Moonbeam", 
  "Astar", "Cronos", "Core", "Celo", "Klaytn", "Metis", "Mode", "Manta", "Taiko", "Fuel", "Aleo", "Babylon", 
  "EigenLayer", "Hyperliquid", "Jupiter", "Wormhole", "Pyth", "LayerZero"
].sort();

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    username: ''
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedChains, setSelectedChains] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, setUser, loading } = useAuth();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Sync Google Data into Form
  useEffect(() => {
    if (user && !formData.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        username: user.username || ''
      }));
    }
  }, [user]);

  // Wallet Connection Feedback
  useEffect(() => {
    if (isConnected) toast.success("Wallet synchronized.");
  }, [isConnected]);

  const handleNext = () => {
    if (currentStep === 0 && !formData.fullName) {
      toast.error("Codename required.");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
    } else {
      completeOnboarding();
    }
  };

  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const filteredItems = useMemo(() => {
    const list = currentStep === 2 ? SKILLS : ECOSYSTEMS;
    return list.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentStep, searchQuery]);

  const completeOnboarding = async () => {
    const toastId = toast.loading("Forging identity...");
    try {
      const { data } = await api.put('/auth/profile', {
        full_name: formData.fullName,
        bio: formData.bio,
        username: formData.username || user?.username,
        skills: selectedSkills,
        preferred_chains: selectedChains,
        wallet_address: address,
        is_pro: false 
      });
      setUser(data);
      toast.success("Identity forged! Welcome to Mission Control.", { id: toastId });
      router.push('/dashboard');
    } catch (error) {
      toast.error("Failed to save preferences.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#050403] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#ff5500]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#ffaa00]/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12">
           {steps.map((step, idx) => (
             <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${idx <= currentStep ? 'border-[#ff5500] bg-[#ff5500] text-black shadow-[0_0_15px_rgba(255,85,0,0.5)]' : 'border-[#1a1512] bg-transparent text-gray-600'}`}>
                   {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                <div className={`text-[9px] uppercase font-mono tracking-widest ${idx <= currentStep ? 'text-white' : 'text-gray-700'}`}>{step.id}</div>
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="glass-card p-8 lg:p-12 text-center"
          >
            <h1 className="text-4xl font-black mb-2 tracking-tight">{steps[currentStep].title}</h1>
            <p className="text-gray-400 mb-8">{steps[currentStep].subtitle}</p>

            {/* Step 0: Identity */}
            {currentStep === 0 && (
              <div className="space-y-4 text-left max-w-md mx-auto py-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gray-500">Forge Username (Codename)</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff5500]" size={16} />
                    <input 
                      type="text" 
                      placeholder="e.g. satoshi_scout"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#ff5500] focus:outline-none transition-colors font-mono text-sm"
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gray-500">Display Name (Auto-filled from Google)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type="text" 
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#ff5500] focus:outline-none transition-colors"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gray-500">Professional Bio</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-600" size={16} />
                    <textarea 
                      placeholder="Forge your story... What do you build?"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#ff5500] focus:outline-none transition-colors resize-none"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Wallet */}
            {currentStep === 1 && (
              <div className="flex flex-col items-center gap-8 py-8">
                 <div className={`p-8 rounded-full border transition-all duration-700 ${isConnected ? 'bg-[#10b981]/10 border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-[#ff5500]/5 border-[#ff5500]/20 animate-pulse'}`}>
                    <Zap size={64} className={isConnected ? 'text-[#10b981]' : 'text-[#ff5500]'} />
                 </div>
                 <ConnectButton />
                 <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                   Syncing your wallet allows our AI agents to analyze your on-chain contributions and prioritize missions that fit your profile.
                 </p>
              </div>
            )}

            {/* Step 2 & 3: Selection with Search */}
            {(currentStep === 2 || currentStep === 3) && (
              <div className="space-y-6">
                <div className="relative max-w-md mx-auto">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                   <input 
                     type="text"
                     placeholder={`Search ${currentStep === 2 ? 'skills' : 'ecosystems'}...`}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#ff5500] focus:outline-none transition-colors"
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>

                {/* Selected Items Tags */}
                <div className="flex flex-wrap gap-2 justify-center min-h-[32px]">
                   {(currentStep === 2 ? selectedSkills : selectedChains).map(item => (
                     <span key={item} className="flex items-center gap-2 px-3 py-1 bg-[#ff5500] text-black text-[11px] font-bold rounded-full group cursor-pointer" onClick={() => toggleItem(item, currentStep === 2 ? selectedSkills : selectedChains, currentStep === 2 ? setSelectedSkills : setSelectedChains)}>
                        {item} <X size={12} />
                     </span>
                   ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                   {filteredItems.map(item => {
                     const isSelected = (currentStep === 2 ? selectedSkills : selectedChains).includes(item);
                     return (
                       <button 
                         key={item}
                         onClick={() => toggleItem(item, currentStep === 2 ? selectedSkills : selectedChains, currentStep === 2 ? setSelectedSkills : setSelectedChains)}
                         className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2 overflow-hidden ${isSelected ? 'border-[#ff5500] bg-[#ff5500]/10 text-white' : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/20'}`}
                       >
                         {currentStep === 2 ? <Hammer size={12} /> : <Globe size={12} />}
                         <span className="truncate text-[12px]">{item}</span>
                       </button>
                     )
                   })}
                </div>
              </div>
            )}

            {/* Sticky Navigation Footer */}
            <div className="mt-10 flex justify-between items-center bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5">
                <div className="text-left hidden sm:block">
                   <div className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Protocol Sync</div>
                   <div className="h-1.5 w-40 bg-[#1a1512] rounded-full mt-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00] shadow-[0_0_15px_#ff5500]" 
                      />
                   </div>
                </div>
                
                <div className="flex gap-4 w-full sm:w-auto">
                  {currentStep > 0 && (
                    <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                      Back
                    </button>
                  )}
                  <button 
                    onClick={handleNext}
                    className="flex-1 sm:flex-none btn btn-primary px-10 rounded-xl shadow-[0_0_30px_rgba(255,85,0,0.3)] flex items-center justify-center gap-2 font-black group transition-all"
                  >
                    {currentStep === steps.length - 1 ? 'Forge Identity' : 'Proceed'}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-12 text-[10px] text-gray-700 font-mono tracking-[0.2em] uppercase">
           AGENTIC_PROTOCOL // ONBOARDING_SEQUENCE_ACTIVE // v1.0.4
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1512; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}
