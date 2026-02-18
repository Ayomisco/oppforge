'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Check, Zap, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function MembershipPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  // ARB Pricing (Assumed 1 ARB = $0.50 approx for simple math, can be dynamic later)
  // Monthly: $15 -> 30 ARB
  // Yearly: $150 -> 300 ARB (2 months free)
  const plans = {
    monthly: { price: '30', period: '/mo', label: 'Monthly' },
    yearly: { price: '300', period: '/yr', label: 'Yearly (Save 17%)' },
  };

  const handleSubscribe = async (plan) => {
    // Integrate Helio/Sphere checkout here
    toast.loading(`Initializing payment for ${plan} plan...`);
    setTimeout(() => {
        toast.dismiss();
        toast.error("Payment Gateway (Helio) not configured yet.");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#d4af37]">
            UPGRADE_YOUR_ARSENAL
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
            Unlock AI-powered intelligence, automated mission drafting, and exclusive high-yield opportunities.
        </p>
        
        {/* Toggle */}
        <div className="flex justify-center mt-6">
            <div className="bg-[#111] p-1 rounded-full border border-[#333] flex items-center">
                <button 
                    onClick={() => setBilling('monthly')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-[#333] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    Monthly
                </button>
                <button 
                    onClick={() => setBilling('yearly')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billing === 'yearly' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_#D4AF37]/40' : 'text-gray-500 hover:text-white'}`}
                >
                    Yearly
                </button>
            </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Free Plan */}
        <div className="p-8 rounded-2xl border border-[#333] bg-[#0A0A0A] space-y-6 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
                <Shield size={24} className="text-gray-400" />
                <h3 className="text-xl font-bold text-white">Scout</h3>
            </div>
            <div className="text-3xl font-bold text-white">
                0 <span className="text-lg font-normal text-gray-500">ARB</span>
            </div>
            <p className="text-sm text-gray-500">Basic access to public opportunities.</p>
            
            <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} /> View Dashboard</li>
                <li className="flex items-center gap-2"><Check size={16} /> Basic Search</li>
                <li className="flex items-center gap-2"><Check size={16} /> 3 Saved Missions</li>
                <li className="flex items-center gap-2 text-gray-600"><Check size={16} /> AI Cover Letters</li>
            </ul>

            <Button variant="outline" className="w-full border-[#333] text-gray-400 cursor-not-allowed">
                Current Plan
            </Button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 rounded-2xl border border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/5 to-black space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 bg-[#D4AF37]/10 blur-[80px] rounded-full group-hover:bg-[#D4AF37]/20 transition-all" />
            
            <div className="flex items-center gap-3">
                <Crown size={24} className="text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-[#D4AF37]">Vangaurd</h3>
            </div>
            <div className="text-5xl font-bold text-white tracking-tighter">
                {plans[billing].price} <span className="text-lg font-normal text-gray-500">ARB</span>
                <span className="text-sm font-normal text-gray-600 ml-1">{plans[billing].period}</span>
            </div>
            <p className="text-sm text-gray-400">Full autonomy for serious builders.</p>
            
            <ul className="space-y-4 text-sm text-white">
                <li className="flex items-center gap-2"><Check size={16} className="text-[#D4AF37]" /> Unlimited AI Drafts</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-[#D4AF37]" /> Win Probability Score</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-[#D4AF37]" /> Auto-Apply (One-Click)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-[#D4AF37]" /> Priority Support</li>
            </ul>

            <Button 
                onClick={() => handleSubscribe(billing)}
                className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold h-12 shadow-[0_0_20px_#D4AF37]/20"
            >
                Upgrade Now
            </Button>
        </div>

      </div>
    </div>
  );
}
