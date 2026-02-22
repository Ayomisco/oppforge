'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  CreditCard, Shield, Zap, Crown, ArrowRight, Clock, 
  CheckCircle, AlertCircle, Download, Settings, User, Bell, Receipt, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const PLAN_DETAILS = {
  scout: { name: 'Scout', price: '$0', period: '14-Day Trial', color: '#10b981', icon: Shield },
  hunter: { name: 'Hunter', price: '$2.9', period: '/month', color: '#ff5500', icon: Zap },
  founder: { name: 'Founder', price: '$6', period: '/month', color: '#D4AF37', icon: Crown },
};

export default function BillingPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [historyRes, invoicesRes] = await Promise.all([
          api.get('/billing/history'),
          api.get('/billing/invoices')
        ]);
        setHistory(historyRes.data);
        setInvoices(invoicesRes.data);
      } catch (err) {
        console.error("Failed to fetch billing data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBillingData();
  }, [user]);

  const trialInfo = useMemo(() => {
    if (!user) return {};
    const isAdmin = user.role === 'admin' || user.role === 'ADMIN';
    const trialStart = user?.trial_started_at ? new Date(user.trial_started_at) : (user?.created_at ? new Date(user.created_at) : new Date());
    const now = new Date();
    const daysUsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 14 - daysUsed);
    const isTrialing = user?.subscription_status === 'trialing' && daysLeft > 0 && !isAdmin;
    const isExpired = user?.subscription_status === 'trialing' && daysLeft <= 0 && !isAdmin;
    const isActive = user?.subscription_status === 'active' || user?.is_pro || isAdmin;
    return { daysLeft, daysUsed, isTrialing, isExpired, isActive, isAdmin };
  }, [user]);

  const currentPlan = PLAN_DETAILS[user?.tier || 'scout'];
  const PlanIcon = currentPlan?.icon || Shield;

  if (loading) return <div className="max-w-4xl mx-auto py-20 text-center font-mono text-gray-500 uppercase animate-pulse">Initializing Billing Module...</div>;

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
              // Protocol Access
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${currentPlan.color}15` }}>
                  <PlanIcon size={24} style={{ color: currentPlan.color }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white lowercase tracking-tighter italic">{currentPlan.name} Plan</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{currentPlan.price}</span>
                    <span className="text-sm text-gray-500">{currentPlan.period}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {trialInfo.isAdmin ? (
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffaa00]/10 border border-[#ffaa00]/20">
                   <Crown size={12} className="text-[#ffaa00]" />
                   <span className="text-[#ffaa00] text-sm font-bold uppercase">ADMIN</span>
                 </div>
                ) : trialInfo.isTrialing ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <Clock size={12} className="text-[#10b981]" />
                    <span className="text-[#10b981] text-sm font-mono font-bold">{trialInfo.daysLeft}d remaining</span>
                  </div>
                ) : trialInfo.isActive && !trialInfo.isTrialing ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <CheckCircle size={12} className="text-[#10b981]" />
                    <span className="text-[#10b981] text-sm font-bold uppercase">Active</span>
                  </div>
                ) : trialInfo.isExpired ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={12} className="text-red-400" />
                    <span className="text-red-400 text-sm font-bold uppercase">Expired</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Trial Progress */}
            {trialInfo.isTrialing && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Trial Progress</span>
                  <span className="text-[10px] font-mono text-gray-500">Day {trialInfo.daysUsed} of 14</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(trialInfo.daysUsed / 14) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#10b981] to-[#ff5500] rounded-full shadow-[0_0_8px_#10b981]"
                  />
                </div>
                <p className="mt-3 text-[11px] font-mono text-gray-600">
                  Your trial ends in {trialInfo.daysLeft} days. Upgrade now to keep full AI clearance.
                </p>
              </div>
            )}

            {trialInfo.isExpired && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-sm text-red-400 font-bold mb-2 uppercase tracking-tighter">PROTOCOL_ACCESS_LOCKED</p>
                  <p className="text-[11px] text-gray-500 mb-4 font-mono leading-relaxed">Your 14-day clearance has concluded. Upgrade to Hunter ($2.9/mo) to restore AI services.</p>
                  <Link href="/dashboard/subscription" className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#ff7700] transition-colors shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                    View Access Plans <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Encryption Key (Payment)
            </h3>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 group">
              <div className="p-2 rounded-lg bg-[#627eea]/10 group-hover:bg-[#627eea]/20 transition-colors">
                <CreditCard size={20} className="text-[#627eea]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white uppercase tracking-tight">On-Chain Wallet (ETH)</div>
                <div className="text-[10px] text-gray-600 font-mono tracking-widest">
                  {user?.wallet_address 
                    ? `${user.wallet_address.slice(0, 12)}...${user.wallet_address.slice(-8)}` 
                    : 'NULL_ADDRESS_CONNECTED'}
                </div>
              </div>
              <Link href="/dashboard/settings" className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 hover:text-white hover:border-white/30 transition-all uppercase font-bold">
                Update
              </Link>
            </div>

            <p className="mt-4 text-[10px] text-gray-700 font-mono leading-relaxed">
              Payments are verified on the Arbitrum network. Invoices are generated as cryptographically-signed records of your contribution to the forge.
            </p>
          </div>

          {/* Invoice History */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Transaction Records
            </h3>

            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-[#10b981]/10">
                        <Receipt size={14} className="text-[#10b981]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{inv.invoice_number}</div>
                        <div className="text-[9px] text-gray-600 font-mono">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                         <div className="text-xs font-black text-white">{inv.amount} ETH</div>
                         <div className="text-[9px] text-[#10b981] font-mono font-bold uppercase tracking-widest">Confirmed</div>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/10">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded border border-dashed border-white/5">
                <Receipt className="mx-auto mb-3 text-gray-800" size={24} />
                <div className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.2em]">No_Invoices_Found</div>
                <p className="text-[9px] text-gray-800 font-mono mt-1">Upgrade your level to generate records.</p>
              </div>
            )}
          </div>

          {/* On-Chain History */}
          <div className="glass-card p-6">
             <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
              // Blockchain Events
            </h3>
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(tx => (
                        <div key={tx.id} className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <Zap size={14} className="text-[#ff5500] mt-1" />
                                <div>
                                    <div className="text-[11px] font-bold text-white uppercase tracking-tight">Access Level Up: {tx.tier}</div>
                                    <a 
                                      href={`https://arbiscan.io/tx/${tx.tx_hash}`} 
                                      target="_blank" 
                                      className="text-[9px] font-mono text-gray-600 hover:text-[#ff5500] flex items-center gap-1 mt-1 transition-colors"
                                    >
                                        TX: {tx.tx_hash.slice(0, 16)}... <ExternalLink size={8} />
                                    </a>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-[9px] text-gray-800 font-mono uppercase tracking-widest py-4">No_On_Chain_Events_Detected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
