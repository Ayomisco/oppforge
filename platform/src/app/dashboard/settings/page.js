'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/api';
import { CHAIN_LABELS } from '@/lib/chains';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { User, Wallet, Github, Twitter, Bell, Shield, Save, Link as LinkIcon, Zap, Receipt, Mail, Eye, EyeOff, Key, Smartphone, AlertTriangle, Clock, Filter, Volume2, VolumeX, FileText, Upload, X, CheckCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import FeatureGate from '@/components/ui/FeatureGate';

const fetcher = url => api.get(url).then(res => res.data);

export default function SettingsPage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [skills, setSkills] = useState([]);
  const [chains, setChains] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    wallet_address: '',
    github_handle: '',
    twitter_handle: '',
    discord_handle: '',
    linkedin_url: '',
  });

  // Fetch uploaded CVs
  const { data: uploads, error: uploadsError, mutate: mutateUploads } = useSWR('/workspace/uploads', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
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
        discord_handle: user.discord_handle || '',
        linkedin_url: user.linkedin_url || '',
      }));
      setSkills(user.skills || []);
      setChains(user.preferred_chains || []);
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
      const { data } = await api.put('/auth/profile', {
        ...formData,
        skills,
        preferred_chains: chains,
      });
      setUser(data);
      toast.success("Identity profile forged!");
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error("Update failed:", error);
      toast.error("Failed to sync matrix.");
    } finally {
      setLoading(false);
    }
  };

  // Google Account Linking (for wallet-authenticated users)
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const isWalletOnlyUser = user?.email?.endsWith('@web3.internal');

  const handleGoogleLink = async (response) => {
    setLinkingGoogle(true);
    try {
      const { data } = await api.post('/auth/link-google', { token: response.access_token });
      // Update token with new email-based JWT
      if (data.access_token) {
        Cookies.set('token', data.access_token, { expires: 7, path: '/', sameSite: 'lax', secure: true });
      }
      setUser(data.user);
      toast.success('Google account linked! Your email and profile have been updated.');
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to link Google account';
      toast.error(msg);
    } finally {
      setLinkingGoogle(false);
    }
  };

  const linkGoogle = useGoogleLogin({
    onSuccess: handleGoogleLink,
    onError: () => toast.error('Google linking failed'),
  });

  // Alert preferences state
  const [alertPrefs, setAlertPrefs] = useState({
    new_opportunities: true,
    deadline_reminders: true,
    ai_score_threshold: 70,
    categories: ['grants', 'hackathons', 'bounties', 'airdrops', 'testnets'],
    frequency: 'instant',
    sound_enabled: false,
  });

  const toggleAlertCategory = (cat) => {
    setAlertPrefs(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const saveAlertPrefs = async () => {
    try {
      const { data } = await api.put('/auth/profile', { notification_settings: alertPrefs });
      setUser(data);
      localStorage.setItem('oppforge_alert_prefs', JSON.stringify(alertPrefs));
      toast.success('Alert preferences synced to your profile');
    } catch (error) {
      // Fallback to localStorage if backend fails
      localStorage.setItem('oppforge_alert_prefs', JSON.stringify(alertPrefs));
      toast.success('Alert preferences saved locally');
      if (process.env.NODE_ENV !== 'production') console.error('Failed to sync alert prefs to backend:', error);
    }
  };

  // CV Upload handlers
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.md'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowed.includes(ext)) {
      toast.error('Only PDF, DOC, DOCX, TXT, or MD files are allowed');
      return;
    }
    if (file.size > maxSize) {
      toast.error('File must be smaller than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/workspace/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      mutateUploads(); // Refresh uploads list
      toast.success('CV uploaded successfully!');
      e.target.value = ''; // Reset input
    } catch (error) {
      const msg = error.response?.data?.detail || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = async (id) => {
    if (!confirm('Delete this CV? This cannot be undone.')) return;
    try {
      await api.delete(`/workspace/uploads/${id}`);
      mutateUploads(); // Refresh uploads list
      toast.success('CV deleted successfully');
    } catch (error) {
      toast.error('Failed to delete CV');
    }
  };

  // Load alert prefs from backend user data, fallback to localStorage
  useEffect(() => {
    if (user?.notification_settings) {
      const ns = user.notification_settings;
      setAlertPrefs(prev => ({
        ...prev,
        new_opportunities: ns.new_opportunities ?? prev.new_opportunities,
        deadline_reminders: ns.deadline_reminders ?? prev.deadline_reminders,
        ai_score_threshold: ns.ai_score_threshold ?? prev.ai_score_threshold,
        categories: ns.categories ?? prev.categories,
        frequency: ns.frequency ?? prev.frequency,
        sound_enabled: ns.sound_enabled ?? prev.sound_enabled,
      }));
    } else {
      const saved = localStorage.getItem('oppforge_alert_prefs');
      if (saved) {
        try { setAlertPrefs(JSON.parse(saved)); } catch {}
      }
    }
  }, [user]);

  // Security state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new_password: '', confirm: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Current Browser', location: 'Active Session', last_active: 'Now', current: true },
  ]);

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
           {[
             { key: 'profile', icon: User, label: 'Profile' },
             { key: 'alerts', icon: Bell, label: 'Alerts' },
             { key: 'security', icon: Shield, label: 'Security' },
           ].map(tab => (
             <button 
               key={tab.key}
               onClick={() => setActiveTab(tab.key)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                 activeTab === tab.key 
                   ? 'bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20' 
                   : 'text-gray-400 hover:bg-white/5 border border-transparent'
               }`}
             >
               <tab.icon size={16} /> {tab.label}
             </button>
           ))}
           <button 
               onClick={() => window.location.href = '/dashboard/settings/billing'}
               className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-400 hover:text-[#ff5500] hover:bg-[#ff5500]/5 text-xs font-bold uppercase tracking-widest transition-colors border border-transparent"
             >
               <Receipt size={16} /> Billing
             </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">

          {/* ========== ALERTS TAB ========== */}
          {activeTab === 'alerts' && (
            <>
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  // Notification Preferences
                </h3>

                {/* Toggle Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded border border-white/5">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className="text-[#ff5500]" />
                      <div>
                        <p className="text-sm text-white font-bold">New Opportunities</p>
                        <p className="text-[10px] text-gray-500 font-mono">Get notified when new missions match your profile</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAlertPrefs(p => ({ ...p, new_opportunities: !p.new_opportunities }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${alertPrefs.new_opportunities ? 'bg-[#ff5500]' : 'bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alertPrefs.new_opportunities ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded border border-white/5">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-[#ffaa00]" />
                      <div>
                        <p className="text-sm text-white font-bold">Deadline Reminders</p>
                        <p className="text-[10px] text-gray-500 font-mono">Alert 24h before tracked mission deadlines</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAlertPrefs(p => ({ ...p, deadline_reminders: !p.deadline_reminders }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${alertPrefs.deadline_reminders ? 'bg-[#ff5500]' : 'bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alertPrefs.deadline_reminders ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded border border-white/5">
                    <div className="flex items-center gap-3">
                      {alertPrefs.sound_enabled ? <Volume2 size={16} className="text-green-400" /> : <VolumeX size={16} className="text-gray-500" />}
                      <div>
                        <p className="text-sm text-white font-bold">Sound Alerts</p>
                        <p className="text-[10px] text-gray-500 font-mono">Play notification sound for new alerts</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAlertPrefs(p => ({ ...p, sound_enabled: !p.sound_enabled }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${alertPrefs.sound_enabled ? 'bg-[#ff5500]' : 'bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alertPrefs.sound_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Score Threshold */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  // AI Score Filter
                </h3>
                <p className="text-[11px] text-gray-400">Only notify me about opportunities with AI score above:</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="100" step="5"
                    value={alertPrefs.ai_score_threshold}
                    onChange={(e) => setAlertPrefs(p => ({ ...p, ai_score_threshold: parseInt(e.target.value) }))}
                    className="flex-1 accent-[#ff5500]"
                  />
                  <span className="text-lg font-bold text-[#ff5500] font-mono w-12 text-right">{alertPrefs.ai_score_threshold}</span>
                </div>
              </div>

              {/* Category Filters */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  <Filter size={12} className="inline mr-2" /> Category Filters
                </h3>
                <p className="text-[11px] text-gray-400 mb-3">Select which categories trigger notifications:</p>
                <div className="flex flex-wrap gap-2">
                  {['grants', 'hackathons', 'bounties', 'airdrops', 'testnets', 'ambassador', 'jobs'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => toggleAlertCategory(cat)}
                      className={`px-3 py-1.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                        alertPrefs.categories.includes(cat)
                          ? 'border-[#ff5500]/40 bg-[#ff5500]/10 text-[#ff5500]'
                          : 'border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  // Delivery Frequency
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'instant', label: 'Instant', desc: 'As they arrive' },
                    { value: 'daily', label: 'Daily Digest', desc: 'Once per day' },
                    { value: 'weekly', label: 'Weekly Digest', desc: 'Weekly summary' },
                  ].map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => setAlertPrefs(p => ({ ...p, frequency: opt.value }))}
                      className={`p-3 rounded border text-center transition-all ${
                        alertPrefs.frequency === opt.value
                          ? 'border-[#ff5500]/40 bg-[#ff5500]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <p className={`text-xs font-bold ${alertPrefs.frequency === opt.value ? 'text-[#ff5500]' : 'text-gray-300'}`}>{opt.label}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveAlertPrefs} className="btn btn-primary w-full shadow-[0_0_20px_rgba(255,85,0,0.3)]">
                <Save size={16} /> Save Alert Preferences
              </button>
            </>
          )}

          {/* ========== SECURITY TAB ========== */}
          {activeTab === 'security' && (
            <>
              {/* Password Change */}
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  <Key size={12} className="inline mr-2" /> Password & Authentication
                </h3>

                {user?.wallet_address && !user?.email?.endsWith('@web3.internal') ? (
                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded">
                    <p className="text-sm text-green-400 font-bold mb-1">Web3 + Google Authenticated</p>
                    <p className="text-[11px] text-gray-400">Your account is secured via wallet signature and Google OAuth. No password needed.</p>
                  </div>
                ) : user?.wallet_address ? (
                  <div className="p-4 bg-[#ff5500]/5 border border-[#ff5500]/20 rounded">
                    <p className="text-sm text-[#ff5500] font-bold mb-1">Wallet-Only Authentication</p>
                    <p className="text-[11px] text-gray-400">Your account is secured by your wallet signature. Link a Google account in the Profile tab for added recovery options.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-400">Google OAuth accounts do not use passwords. Your account is protected by Google's security.</p>
                  </div>
                )}
              </div>

              {/* Two-Factor */}
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  <Smartphone size={12} className="inline mr-2" /> Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded border border-white/5">
                  <div>
                    <p className="text-sm text-white font-bold">2FA Status</p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {twoFactorEnabled ? 'Enabled — Your account has an extra layer of protection' : 'Not enabled — Add an extra layer of security'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                    twoFactorEnabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {twoFactorEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button 
                  onClick={() => toast('2FA setup coming soon — will support authenticator apps', { icon: '🔒' })}
                  className="w-full py-2.5 rounded border border-white/10 bg-white/[0.02] text-gray-300 text-xs font-bold uppercase tracking-wider hover:border-[#ff5500]/30 hover:text-[#ff5500] transition-all"
                >
                  <Shield size={14} className="inline mr-2" /> {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
                  // Active Sessions
                </h3>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
                        <div>
                          <p className="text-xs text-white font-bold">{session.device}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{session.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">{session.last_active}</p>
                        {session.current && <span className="text-[9px] text-green-400 font-bold">THIS DEVICE</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card p-6 space-y-4 border-red-500/10">
                <h3 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest border-b border-red-500/10 pb-4">
                  <AlertTriangle size={12} className="inline mr-2" /> Danger Zone
                </h3>
                <div className="flex items-center justify-between p-3 bg-red-500/5 rounded border border-red-500/10">
                  <div>
                    <p className="text-sm text-white font-bold">Delete Account</p>
                    <p className="text-[10px] text-gray-500">Permanently remove your account and all data</p>
                  </div>
                  <button 
                    onClick={() => toast.error('Account deletion requires email confirmation. Feature coming soon.')}
                    className="px-4 py-2 rounded border border-red-500/30 text-red-400 text-[10px] font-bold uppercase hover:bg-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========== PROFILE TAB (existing content) ========== */}
          {activeTab === 'profile' && (
            <>
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

            {/* Google Account Linking (for wallet users) */}
            {isWalletOnlyUser && (
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Link Google Account</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  You signed in with your wallet. Link your Google account to enable email notifications, 
                  recover your account, and auto-fill your profile details.
                </p>
                <button
                  onClick={() => linkGoogle()}
                  disabled={linkingGoogle}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:border-blue-500/30 transition-all text-sm text-white"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  {linkingGoogle ? 'Linking...' : 'Connect Google Account'}
                </button>
              </div>
            )}

            {/* Show linked email for wallet users who already linked */}
            {user?.wallet_address && !isWalletOnlyUser && (
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-2">
                <Mail size={14} className="text-green-400" />
                <span className="text-[11px] text-gray-300 font-mono">{user.email}</span>
                <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-bold">Google Linked</span>
              </div>
            )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">Discord</label>
                 <div className="relative">
                    <input 
                      name="discord_handle"
                      value={formData.discord_handle}
                      onChange={handleChange}
                      className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors font-mono"
                      placeholder="username#0000"
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-600 uppercase">LinkedIn URL</label>
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      placeholder="linkedin.com/in/username"
                    />
                 </div>
               </div>
            </div>
          </div>

          {/* Section: Skills & Ecosystems */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">
               // Superpowers & Ecosystems
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Skills</label>
              <div className="flex flex-wrap gap-2">
                {['Smart Contracts', 'Frontend', 'Backend', 'DeFi', 'Protocols', 'Security', 'Marketing', 'Content', 'DAO Ops', 'Rust', 'Solidity', 'Zero Knowledge', 'Governance', 'Tokenomics', 'Community', 'Design', 'Research', 'DevRel', 'Auditing', 'TypeScript', 'Python', 'Move', 'Vyper', 'Cairo', 'NFTs'].map(s => (
                  <button key={s} type="button" onClick={() => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`px-3 py-1.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      skills.includes(s) ? 'border-[#ff5500]/40 bg-[#ff5500]/10 text-[#ff5500]' : 'border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300'
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Preferred Chains</label>
              <div className="flex flex-wrap gap-2">
                {CHAIN_LABELS.map(c => (
                  <button key={c} type="button" onClick={() => setChains(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                    className={`px-3 py-1.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      chains.includes(c) ? 'border-[#ffaa00]/40 bg-[#ffaa00]/10 text-[#ffaa00]' : 'border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300'
                    }`}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: CV Upload */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                // CV / Resume Management
              </h3>
              <div className="text-[9px] text-gray-600 font-mono">MAX 3 UPLOADS/DAY</div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Upload your CV, resume, or portfolio. Our AI will analyze it to provide personalized opportunity recommendations, better scores, and tailored workspace responses.
            </p>

            {/* Upload Button */}
            <label className={`cursor-pointer block ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleCVUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-lg border-2 border-dashed border-white/10 hover:border-[#ff5500]/40 bg-white/[0.02] hover:bg-[#ff5500]/5 transition-all group">
                <Upload size={20} className="text-gray-500 group-hover:text-[#ff5500] transition-colors" />
                <div className="text-center">
                  <p className="text-sm text-white font-bold group-hover:text-[#ff5500] transition-colors">
                    {uploading ? 'Uploading...' : 'Upload CV or Resume'}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    PDF, DOC, DOCX, TXT, MD · Max 5MB
                  </p>
                </div>
              </div>
            </label>

            {/* Uploaded Files List */}
            {uploads && uploads.length > 0 ? (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-600 uppercase">Your Uploads ({uploads.length})</label>
                <div className="space-y-2">
                  {uploads.map(upload => (
                    <div key={upload.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded border border-white/5 group hover:border-[#ff5500]/20 transition-all">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={18} className="text-green-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{upload.filename}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-[10px] text-gray-600 font-mono">{(upload.file_size / 1024).toFixed(1)} KB</p>
                            <p className="text-[10px] text-gray-600 font-mono">{new Date(upload.uploaded_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCV(upload.id)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : uploadsError ? (
              <div className="text-center py-4 text-[11px] text-gray-600">
                Failed to load uploads
              </div>
            ) : uploads && uploads.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-gray-600 italic">
                No CVs uploaded yet
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-[#ff5500] border-t-transparent rounded-full" />
              </div>
            )}

            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
              <p className="text-[10px] text-blue-400 leading-relaxed">
                <CheckCircle size={12} className="inline mr-1" />
                Your CV is analyzed to enhance AI scoring, workspace responses, and opportunity matching. Daily limit: 3 uploads.
              </p>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
