import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Zap, ShieldAlert } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function FeatureGate({ children, featureName = "This feature", requirePremium = true }) {
  const { user, isGuest, loading } = useAuth();
  
  if (loading) {
     return (
       <div className="min-h-[400px] flex items-center justify-center">
         <div className="h-10 w-48 bg-white/5 animate-pulse rounded" />
       </div>
     )
  }

  // 1. Not logged in (Guest/Scout)
  if (isGuest || !user) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto mt-12 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ff5500]/5 pointer-events-none" />
        
        <div className="w-16 h-16 bg-[#ff5500]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ff5500]/20">
          <Lock size={32} className="text-[#ff5500]" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-gray-400 text-sm">
            {featureName} is locked for scouts. Connect your wallet or sign in to forge your identity and unlock mission control.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/5">
           <ConnectButton />
           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-600">Secure Web3 Connection</p>
        </div>
      </div>
    );
  }

  // 2. Normal user vs Premium Block
  const role = (user.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const isSubscriber = ['active', 'trialing'].includes((user.subscription_status || '').toLowerCase()) || user.is_pro;

  if (requirePremium && !isAdmin && !isSubscriber) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto mt-12 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ffaa00]/5 pointer-events-none" />
        
        <div className="w-16 h-16 bg-[#ffaa00]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ffaa00]/20">
          <ShieldAlert size={32} className="text-[#ffaa00]" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Premium Intel Required</h2>
          <p className="text-gray-400 text-sm">
            {featureName} requires an active Forge Pass. Upgrade your rank to unlock advanced tracking, AI drafting, and personalized algorithms.
          </p>
        </div>

        <div className="flex justify-center pt-4 border-t border-white/5">
           <a 
             href="/dashboard/settings/billing" 
             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff5500] to-[#ffaa00] text-black font-bold rounded-xl hover:scale-105 transition-transform"
           >
             <Zap size={16} /> Upgrade Forge Pass
           </a>
        </div>
      </div>
    );
  }

  // 3. User is authorized
  return <>{children}</>;
}
