import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import { Lock, Zap, ShieldAlert, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function FeatureGate({ children, featureName = "This feature", requirePremium = true }) {
  const { user, isGuest, loading } = useAuth();
  const pathname = usePathname();
  
  if (loading) {
     return (
       <div className="min-h-[400px] flex items-center justify-center">
         <div className="h-10 w-48 bg-white/5 animate-pulse rounded" />
       </div>
     )
  }

  // 1. Not logged in — blur the content and prompt sign-in
  if (isGuest || !user) {
    const loginUrl = `/login?returnTo=${encodeURIComponent(pathname)}`;
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
              {featureName} is locked for guests. Sign in with Google or connect your wallet to start your 7-day free trial — no credit card required.
            </p>

            <Link
              href={loginUrl}
              className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-[#ff5500] text-white font-bold rounded shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:scale-105 transition-all mb-3"
            >
              <Wallet size={16} /> Sign In / Connect Wallet
            </Link>
            <p className="text-[10px] uppercase font-mono tracking-widest text-gray-600">Secure Web3 Authentication</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check if subscription is explicitly expired/cancelled
  //    Also check client-side if trial has expired (trial_started_at + 7 days < now)
  const role = (user.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const subscriptionStatus = (user.subscription_status || '').toLowerCase();
  const isExplicitlyExpired = ['expired', 'cancelled', 'canceled', 'past_due'].includes(subscriptionStatus);

  // Client-side trial expiry check: if still "trialing" but 7+ days have passed
  let isTrialExpired = false;
  if (subscriptionStatus === 'trialing' && user.trial_started_at) {
    const trialStart = new Date(user.trial_started_at);
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    isTrialExpired = new Date() > trialEnd;
  }

  const isExpired = isExplicitlyExpired || isTrialExpired;

  if (requirePremium && !isAdmin && isExpired) {
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
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Trial Ended</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your 7-day Scout trial has concluded. {featureName} is now locked. Upgrade to Hunter to restore full access to your intelligence dashboard.
            </p>

            <a 
              href="/dashboard/subscription" 
              className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-[var(--accent-forge)] text-white font-bold rounded shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:scale-105 transition-all"
            >
              <Zap size={16} /> Upgrade to Hunter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is authenticated (Scout trial active, or paid subscriber, or admin) — full access
  return <>{children}</>;
}


