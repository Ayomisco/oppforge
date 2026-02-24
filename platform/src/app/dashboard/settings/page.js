'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Wallet, Github, Twitter, Bell, Shield, Save, Link as LinkIcon, Zap, Receipt } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import FeatureGate from '@/components/ui/FeatureGate';

export default function SettingsPage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    wallet_address: '',
    github_handle: '',
    twitter_handle: '',
  });

  // 1. Sync form with existing user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        wallet_address: user.wallet_address || '',
        github_handle: user.github_handle || '',
        twitter_handle: user.twitter_handle || '',
      }));
    }
  }, [user]);

  // 2. Sync wallet address if newly connected
  useEffect(() => {
    if (isConnected && address) {
      setFormData(prev => ({ ...prev, wallet_address: address }));
    }
  }, [isConnected, address]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      setUser(data);
      toast.success("Identity profile forged!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to sync matrix.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><div className="h-8 w-48 bg-white/5 animate-pulse rounded" /><div className="h-4 w-32 bg-white/5 animate-pulse rounded" /></div>
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2"><div className="h-10 w-full bg-white/5 animate-pulse rounded" /><div className="h-10 w-full bg-white/5 animate-pulse rounded" /></div>
        <div className="md:col-span-3 h-96 bg-white/5 animate-pulse rounded" />
      </div>
    </div>
  )

  return (
    <FeatureGate featureName="Identity Settings" requirePremium={false}>
      <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Identity Settings</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Configure your hunter profile</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary shadow-[0_0_20px_rgba(255,85,0,0.3)]"
        >
          {loading ? 'SYNCING...' : <><Save size={16} /> Update Matrix</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs (Vertical for settings) */}
        <div className="lg:col-span-1 space-y-1">
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20 text-xs font-bold uppercase tracking-widest">
             <User size={16} /> Profile
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
             <Bell size={16} /> Alerts
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
             <Shield size={16} /> Security
           </button>
           <button 
               onClick={() => window.location.href = '/dashboard/settings/billing'}
               className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:text-[#ff5500] hover:bg-[#ff5500]/5 text-xs font-bold uppercase tracking-widest transition-colors"
             >
               <Receipt size={16} /> Billing
             </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section: Identity */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
               // Core Identity Module
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">Username / ID</label>
                 <input 
                   name="username"
                   value={formData.username}
                   onChange={handleChange}
                   className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors font-mono"
                   placeholder="hunter_alpha"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">Web3 Wallet</label>
                 <div className="flex flex-col gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-2 p-2 bg-[#ff5500]/5 border border-[#ff5500]/20 rounded group">
                        <Wallet size={14} className="text-[#ff5500]" />
                        <span className="text-[11px] font-mono text-gray-300 truncate flex-1">{formData.wallet_address}</span>
                        <ConnectButton label="Change" accountStatus="avatar" chainStatus="icon" showBalance={false} />
                      </div>
                    ) : (
                      <div className="w-full">
                        <ConnectButton label="Connect Web3 Identity" />
                      </div>
                    )}
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">First Name</label>
                 <input 
                   name="first_name"
                   value={formData.first_name}
                   onChange={handleChange}
                   className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                   placeholder="John"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">Last Name</label>
                 <input 
                   name="last_name"
                   value={formData.last_name}
                   onChange={handleChange}
                   className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                   placeholder="Doe"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-mono text-gray-600 uppercase">Professional Status / Bio</label>
               <textarea 
                 name="bio"
                 value={formData.bio}
                 onChange={handleChange}
                 rows={3}
                 className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                 placeholder="Full-stack engineer specializing in Solidity and ZK proofs..."
               />
            </div>
          </div>

          {/* Section: Socials */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
               // Matrix Connections
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">GitHub Matrix</label>
                 <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      name="github_handle"
                      value={formData.github_handle}
                      onChange={handleChange}
                      className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      placeholder="username"
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">Twitter / X Signal</label>
                 <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      name="twitter_handle"
                      value={formData.twitter_handle}
                      onChange={handleChange}
                      className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      placeholder="@handle"
                    />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
