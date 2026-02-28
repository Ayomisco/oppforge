'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Search, TrendingUp, Award, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Shield,      label: 'Verified Alpha',    sub: 'Only trusted, verifiable ops' },
  { icon: Zap,         label: 'AI-Matched Ops',     sub: 'Scored for your exact stack'  },
  { icon: TrendingUp,  label: 'Grants & Bounties',  sub: 'Testnets, jobs, airdrops'     },
  { icon: Award,       label: 'Hackathons',          sub: 'Curated elite competitions'   },
  { icon: Search,      label: '24/7 Monitoring',    sub: 'X, ecosystems & forums'       },
  { icon: Globe,       label: '50+ Ecosystems',     sub: 'Every major chain covered'    },
];

export default function LoginPage() {
  const { user, loginGoogle, loginWallet } = useAuth();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const loginAttempted = useRef(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Cycle through feature highlights
  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(prev => (prev + 1) % FEATURES.length), 2800);
    return () => clearInterval(timer);
  }, []);

  // Wallet auto-login with SIWE
  useEffect(() => {
    if (isConnected && address && !user && !loginAttempted.current) {
      loginAttempted.current = true;
      
      const handleSiweLogin = async () => {
        try {
            const timestamp = Date.now();
            const message = `Sign in to OppForge\n\nWelcome back, Hunter. Sign this message to authenticate your wallet. This costs zero gas.\n\nAddress: ${address}\nTimestamp: ${timestamp}`;
            
            const signature = await signMessageAsync({ message });
            
            const success = await loginWallet(address, signature, message);
            if (!success) {
              loginAttempted.current = false; // allow retry if backend failed
            }
        } catch (err) {
            console.error("Signature rejected or failed:", err);
            toast.error("Signature required to authenticate");
            loginAttempted.current = false; // allow retry
        }
      };

      handleSiweLogin();
    }
  }, [isConnected, address, user, loginWallet, signMessageAsync]);

  // Redirect after login
  useEffect(() => {
    if (user) {
      const isAdmin = (user.role || '').toLowerCase() === 'admin';
      const isNewUser = user.is_new_user === true;
      const isOnboarded = user.onboarded === true || isAdmin;
      
      if (isNewUser && !isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleGoogleSuccess = async (response) => {
    if (response.access_token) {
      const result = await loginGoogle({ credential: response.access_token });
      if (result?.success) {
        if (result.isNewUser) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign In Failed'),
  });

  return (
    <div className="min-h-screen bg-[#050403] flex items-start lg:items-center justify-center relative overflow-x-hidden py-10 lg:py-0">

      {/* ── Ambient background orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff5500]/8 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ffaa00]/6 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff5500]/10 rounded-full blur-[100px]"
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,85,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,85,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ── Main layout: Left info panel + Right card ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-16">

        {/* ── LEFT: Brand panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex-1 text-center lg:text-left"
        >
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="OppForge" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold text-2xl tracking-tight">OppForge</span>
          </div>

          {/* Pill badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500] text-xs font-mono tracking-widest mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5500] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5500]" />
            </span>
            AGENTIC ERA · v1.0 PUBLIC BETA
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Your Web3{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] via-[#ff8800] to-[#ffaa00]">
              Command<br/>Center
            </span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
            One platform. Every opportunity. Our AI monitors trusted ecosystems 24/7 and surfaces the right grants, bounties, testnets, and jobs — personalized to you.
          </p>

          {/* Animated feature ticker */}
          <div className="relative h-16 overflow-hidden max-w-sm mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
              >
                {(() => {
                  const F = FEATURES[activeFeature];
                  return (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/20 flex items-center justify-center shrink-0">
                        <F.icon size={18} className="text-[#ff5500]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{F.label}</div>
                        <div className="text-gray-500 text-xs">{F.sub}</div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature dots */}
          <div className="flex gap-2 mt-4 justify-center lg:justify-start">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-6 bg-[#ff5500]' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT: Login card ── */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-md shrink-0"
        >
          <div className="relative bg-[#0c0a08]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(255,85,0,0.07)] overflow-hidden p-8">
            {/* Glowing top edge */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#ff5500]/60 to-transparent" />

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to access your forge</p>
            </div>

            {/* Google button — PRIMARY action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loginWithGoogle()}
              className="w-full relative group flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 px-6 rounded-xl text-sm transition-all hover:bg-gray-100 shadow-[0_4px_20px_rgba(255,255,255,0.1)] mb-4"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 rounded-full"
              />
              Continue with Google
              <span className="absolute right-4 text-[10px] font-mono uppercase bg-[#ff5500] text-white px-2 py-0.5 rounded tracking-wider">
                Recommended
              </span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-gray-600 text-xs font-mono uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Wallet section */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-white font-medium text-sm mb-0.5">Web3 Wallet</p>
                <p className="text-gray-500 text-xs">Sign transactions & claim on-chain rewards</p>
              </div>
              <ConnectButton
                label="Connect Wallet"
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Verified Ops',  sub: 'AI-filtered' },
                { label: '50+ Chains',    sub: 'Monitored 24/7' },
                { label: 'Free to Start', sub: 'No card needed' },
              ].map(item => (
                <div key={item.label} className="text-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-white text-xs font-semibold">{item.label}</div>
                  <div className="text-gray-600 text-[10px] mt-0.5">{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-gray-700 text-[10px] font-mono mt-6 tracking-wider uppercase">
              SECURE_CONNECTION // {new Date().getFullYear()} OPPFORGE
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
