import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Zap, ShieldAlert, Wallet, LogIn } from 'lucide-react';

export default function FeatureGate({ children, featureName = "This feature", requirePremium = true }) {
  const { user, isGuest, loading, openLoginModal } = useAuth();
  
  if (loading) {
     return (
       <div className="min-h-[400px] flex items-center justify-center">
         <div className="h-10 w-48 bg-white/5 animate-pulse rounded" />
       </div>
     )
  }

  // 1. Not logged in — blur the content and prompt sign-in
  if (isGuest || !user) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[var(--glass-border)] min-h-[70vh] flex flex-col">
        {/* Blurred preview of the actual page */}
        <div className="blur-[6px] opacity-20 pointer-events-none select-none">
          {children}
        </div>

        {/* Centered sign-in prompt over the blur */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-espresso)]/50 backdrop-blur-sm p-4 text-center z-10">
          <div className="glass-card p-8 text-center max-w-md w-full shadow-2xl relative border-t-2 border-[#ff5500]">
            <div className="absolute inset-0 bg-[#ff5500]/5 pointer-events-none rounded-xl" />

            <div className="w-16 h-16 bg-[#ff5500]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ff5500]/20 shadow-[0_0_20px_rgba(255,85,0,0.2)] mb-4">
              <Lock size={32} className="text-[#ff5500]" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {featureName} is locked for guests. Sign in with Google or connect your wallet to start your 14-day free trial — no credit card required.
            </p>

            <button
              onClick={openLoginModal}
              className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-[#ff5500] text-white font-bold rounded shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:scale-105 transition-all mb-3"
            >
              <Wallet size={16} /> Sign In / Connect Wallet
            </button>
            <p className="text-[10px] uppercase font-mono tracking-widest text-gray-600">Secure Web3 Authentication</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged-in user whose trial has expired — blur with upgrade CTA
  const role = (user.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const isSubscriber = ['active', 'trialing'].includes((user.subscription_status || '').toLowerCase()) || user.is_pro;

  if (requirePremium && !isAdmin && !isSubscriber) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[var(--glass-border)] min-h-[70vh]">
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

  // 3. User is authorized — render children freely
  return <>{children}</>;
}

