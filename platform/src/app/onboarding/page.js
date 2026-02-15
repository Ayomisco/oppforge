'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Check, Hammer, Globe, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { id: 'wallet', title: 'Power Up', subtitle: 'Connect your Web3 identity' },
  { id: 'skills', title: 'Specialize', subtitle: 'What are your core strengths?' },
  { id: 'chains', title: 'Ecosystems', subtitle: 'Which networks do you forge on?' }
];

const SKILLS = ["Smart Contracts", "Frontend", "Backend", "DeFi", "NFTs", "Security", "Marketing", "Content", "DAO Ops"];
const CHAINS = ["Solana", "Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Monad", "Berachain"];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedChains, setSelectedChains] = useState([]);
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  const completeOnboarding = async () => {
    try {
      const { data } = await api.put('/auth/profile', {
        skills: selectedSkills,
        preferred_chains: selectedChains,
        is_pro: false // Default
      });
      setUser(data);
      toast.success("Identity forged! Welcome to Mission Control.");
      router.push('/dashboard');
    } catch (error) {
       toast.error("Failed to save preferences.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050403] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#ff5500]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#ffaa00]/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-xl relative z-10">
        <div className="flex justify-between mb-12">
           {steps.map((step, idx) => (
             <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${idx <= currentStep ? 'border-[#ff5500] bg-[#ff5500] text-black shadow-[0_0_15px_rgba(255,85,0,0.5)]' : 'border-[#1a1512] bg-transparent text-gray-600'}`}>
                  {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                <div className={`text-[10px] uppercase font-mono tracking-widest ${idx <= currentStep ? 'text-white' : 'text-gray-700'}`}>{step.id}</div>
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-10 text-center"
          >
            <h1 className="text-4xl font-bold mb-2">{steps[currentStep].title}</h1>
            <p className="text-gray-400 mb-10">{steps[currentStep].subtitle}</p>

            {currentStep === 0 && (
              <div className="flex flex-col items-center gap-6 py-6">
                 <div className="p-6 rounded-full bg-white/5 border border-white/10 animate-pulse">
                    <Zap size={48} className="text-[#ff5500]" />
                 </div>
                 <ConnectButton />
                 <p className="text-xs text-gray-500 max-w-xs">Connecting your wallet allows our AI to verify your on-chain contributions and prioritize top-tier opportunities.</p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-3 pb-8 text-left">
                 {SKILLS.map(skill => (
                   <button 
                     key={skill}
                     onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                     className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-sm ${selectedSkills.includes(skill) ? 'border-[#ff5500] bg-[#ff5500]/10 text-white' : 'border-[#1a1512] bg-[#0a0806] text-gray-400 hover:border-white/20'}`}
                   >
                     <Hammer size={14} className={selectedSkills.includes(skill) ? 'text-[#ff5500]' : 'text-gray-600'} />
                     {skill}
                   </button>
                 ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-3 pb-8 text-left">
                 {CHAINS.map(chain => (
                   <button 
                     key={chain}
                     onClick={() => toggleItem(chain, selectedChains, setSelectedChains)}
                     className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-sm ${selectedChains.includes(chain) ? 'border-[#ff5500] bg-[#ff5500]/10 text-white' : 'border-[#1a1512] bg-[#0a0806] text-gray-400 hover:border-white/20'}`}
                   >
                     < Globe size={14} className={selectedChains.includes(chain) ? 'text-[#ff5500]' : 'text-gray-600'} />
                     {chain}
                   </button>
                 ))}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center bg-[#050403]/50 p-4 rounded-xl border border-white/5">
                <div className="text-left">
                   <div className="text-[10px] text-gray-600 font-mono uppercase">Identity Progress</div>
                   <div className="h-1 w-32 bg-[#1a1512] rounded-full mt-1">
                      <div className="h-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00] rounded-full shadow-[0_0_10px_#ff5500]" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                   </div>
                </div>
                <button 
                  onClick={handleNext}
                  className="btn btn-primary px-8 rounded-xl shadow-2xl flex items-center gap-2 font-bold group"
                >
                  {currentStep === steps.length - 1 ? 'Forge Identity' : 'Proceed'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-8 text-[10px] text-gray-600 font-mono tracking-widest uppercase">
           AGENTIC_PROTOCOL // ONBOARDING_SEQUENCE_ACTIVE
        </p>
      </div>
    </div>
  );
}
