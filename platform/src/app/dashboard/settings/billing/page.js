'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  CreditCard, Shield, Zap, Crown, ArrowRight, Clock, 
  CheckCircle, AlertCircle, Download, Settings, User, Bell, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const PLAN_DETAILS = {
  scout: { name: 'Scout', price: '$0', period: '14-Day Trial', color: '#10b981', icon: Shield },
  hunter: { name: 'Hunter', price: '$2.9', period: '/month', color: '#ff5500', icon: Zap },
  founder: { name: 'Founder', price: '$6', period: '/month', color: '#D4AF37', icon: Crown },
};

export default function BillingPage() {
  const { user } = useAuth();

  const trialInfo = useMemo(() => {
    const trialStart = user?.trial_started_at ? new Date(user.trial_started_at) : (user?.created_at ? new Date(user.created_at) : new Date());
    const now = new Date();
    const daysUsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 14 - daysUsed);
    const isTrialing = user?.subscription_status === 'trialing' && daysLeft > 0;
    const isExpired = user?.subscription_status === 'trialing' && daysLeft <= 0;
    const isActive = user?.subscription_status === 'active' || user?.is_pro;
    return { daysLeft, daysUsed, isTrialing, isExpired, isActive };
  }, [user]);

  const currentPlan = PLAN_DETAILS[user?.tier || 'scout'];
  const PlanIcon = currentPlan.icon;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Plan</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Manage your subscription</p>
        </div>
        <Link href="/dashboard/subscription" className="btn btn-primary text-xs">
          <Zap size={14} /> Change Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs (Vertical) */}
        <div className="lg:col-span-1 space-y-1">
          <Link href="/dashboard/settings">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
              <User size={16} /> Profile
            </button>
          </Link>
          <Link href="/dashboard/settings">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
              <Bell size={16} /> Alerts
            </button>
          </Link>
          <Link href="/dashboard/settings">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
              <Shield size={16} /> Security
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20 text-xs font-bold uppercase tracking-widest">
            <Receipt size={16} /> Billing
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Plan Card */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Current Plan
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${currentPlan.color}15` }}>
                  <PlanIcon size={24} style={{ color: currentPlan.color }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{currentPlan.name} Plan</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{currentPlan.price}</span>
                    <span className="text-sm text-gray-500">{currentPlan.period}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {trialInfo.isTrialing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <Clock size={12} className="text-[#10b981]" />
                    <span className="text-[#10b981] text-sm font-mono font-bold">{trialInfo.daysLeft}d remaining</span>
                  </div>
                )}
                {trialInfo.isActive && !trialInfo.isTrialing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <CheckCircle size={12} className="text-[#10b981]" />
                    <span className="text-[#10b981] text-sm font-bold">Active</span>
                  </div>
                )}
                {trialInfo.isExpired && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={12} className="text-red-400" />
                    <span className="text-red-400 text-sm font-bold">Expired</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trial Progress */}
            {trialInfo.isTrialing && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Trial Progress</span>
                  <span className="text-[10px] font-mono text-gray-500">Day {trialInfo.daysUsed} of 14</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(trialInfo.daysUsed / 14) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#10b981] to-[#ff5500] rounded-full"
                  />
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Your trial ends in {trialInfo.daysLeft} days. <Link href="/dashboard/subscription" className="text-[#ff5500] hover:underline">Upgrade now</Link> to keep all features.
                </p>
              </div>
            )}

            {trialInfo.isExpired && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-sm text-red-400 font-medium mb-2">Your trial has ended</p>
                  <p className="text-xs text-gray-500 mb-4">Upgrade to Hunter ($2.9/mo) or Founder ($6/mo) to restore full access to AI features.</p>
                  <Link href="/dashboard/subscription" className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white rounded-lg text-sm font-bold hover:bg-[#ff7700] transition-colors">
                    View Plans <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Payment Method
            </h3>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="p-2 rounded-lg bg-[#627eea]/10">
                <CreditCard size={20} className="text-[#627eea]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Crypto Wallet (ETH)</div>
                <div className="text-xs text-gray-500 font-mono">
                  {user?.wallet_address 
                    ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` 
                    : 'No wallet connected'}
                </div>
              </div>
              <Link href="/dashboard/settings" className="text-xs text-[#ff5500] hover:underline font-mono">
                {user?.wallet_address ? 'Change' : 'Connect'}
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-gray-600">
              All payments are processed on-chain via direct ETH transfer. We'll add Paystack/Stripe support for fiat soon.
            </p>
          </div>

          {/* Invoice History */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Invoice History
            </h3>

            {trialInfo.isActive && !trialInfo.isTrialing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <Receipt size={14} className="text-gray-500" />
                    <div>
                      <div className="text-sm text-white">{currentPlan.name} Plan — {currentPlan.price}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] font-mono">Paid</span>
                    <button className="p-1.5 hover:bg-white/5 rounded transition-colors text-gray-500">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 text-sm font-mono">
                No invoices yet. Subscribe to a plan to see your billing history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
