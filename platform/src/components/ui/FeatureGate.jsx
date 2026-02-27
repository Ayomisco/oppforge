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
      <div className="relative overflow-hidden rounded-xl border border-[var(--glass-border)]">
        {/* Blurred App Background */}
        <div className="blur-[8px] opacity-30 pointer-events-none select-none transition-all duration-700">
          {children}
        </div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-espresso)]/60 backdrop-blur-sm p-4 text-center z-10 transition-all duration-700">
          <div className="glass-card p-8 text-center max-w-md w-full shadow-2xl relative border-t-2 border-[var(--accent-forge)]">
            <div className="absolute inset-0 bg-[var(--accent-forge)]/5 pointer-events-none" />
            
            <div className="w-16 h-16 bg-[var(--accent-forge)]/10 rounded-2xl flex items-center justify-center mx-auto border border-[var(--accent-forge)]/20 shadow-[0_0_20px_rgba(255,85,0,0.2)] mb-4">
              <ShieldAlert size={32} className="text-[var(--accent-forge)]" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Locked</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your 14-day trial has concluded. {featureName} is now locked. Upgrade to Hunter to restore your intelligence dashboard and unblur premium opportunities.
            </p>

            <a 
              href="/dashboard/subscription" 
              className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-[var(--accent-forge)] text-white font-bold rounded shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:scale-105 transition-all"
            >
              <Zap size={16} /> Secure Premium Access
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is authorized
  return <>{children}</>;
}
