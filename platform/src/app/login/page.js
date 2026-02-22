'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, loginGoogle, loginWallet } = useAuth();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const loginAttempted = useRef(false);

  useEffect(() => {
    // If wallet is connected and we don't have a user, attempt wallet login
    if (isConnected && address && !user && !loginAttempted.current) {
        loginAttempted.current = true;
        loginWallet(address);
    }
  }, [isConnected, address, user, loginWallet]);

  useEffect(() => {
    if (user) {
      // Admins ALWAYS skip onboarding
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN';
      const isOnboarded = user.onboarded === true || isAdmin;
      
      console.log("LOGIN_REDIRECT_DEBUG:", { 
        email: user.email, 
        onboarded: user.onboarded, 
        role: user.role,
        final_decision: isOnboarded ? 'dashboard' : 'onboarding'
      });

      if (isOnboarded) {
        console.log("Verified returning user/admin. Redirecting to Mission Control...");
        router.push('/dashboard');
      } else {
        console.log("New user detected. Redirecting to Onboarding...");
        router.push('/onboarding');
      }
    }
  }, [user, router]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await loginGoogle(credentialResponse);
    if (success) {
      // The user state in AuthProvider might take a tick to update,
      // but the loginGoogle function has already set the user state.
      // We can check the token to be extra sure or just rely on the next tick.
      toast.success("Syncing Mission Control...");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#050403]">
      
      {/* LEFT: Hero Visual (7 columns) */}
      <div className="hidden lg:relative lg:col-span-7 lg:flex flex-col justify-end p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/login-hero.png"
            alt="The Forge"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050403] via-[#050403]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050403]/80" />
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
             <div className="h-[1px] w-12 bg-[#ff5500]" />
             <span className="text-[#ff5500] font-mono text-sm tracking-[0.2em] uppercase">The Agentic Era</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Forge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">
              Web3 Destiny
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 font-light leading-relaxed mb-8 max-w-lg">
            Stop chasing noise. Our AI Agent scans thousands of on-chain signals to deliver the highest-value grants, bounties, and airdrops directly to your dashboard.
          </p>

          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Shield className="w-5 h-5 text-[#ff5500]" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">Verified Opportunities</div>
                <div className="text-gray-500 text-xs">AI-filtered for safety</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Zap className="w-5 h-5 text-[#ffaa00]" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">Instant Matching</div>
                <div className="text-gray-500 text-xs">Personalized to your skills</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Login Interface (5 columns) */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-8 bg-[#050403] border-l border-[#1a1512] relative">
        {/* Mobile Background (Subtle) */}
        <div className="absolute inset-0 z-0 lg:hidden opacity-20">
             <Image src="/assets/images/login-hero.png" alt="bg" fill className="object-cover" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-[#0a0806]/90 backdrop-blur-xl p-8 rounded-2xl border border-[#1a1512] shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 filter drop-shadow-[0_0_12px_rgba(255,85,0,0.4)]">
              <img src="/logo.png" alt="OppForge Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to OppForge</h2>
            <p className="text-gray-400 text-sm">Sign in to access your command center</p>
          </div>

          <div className="space-y-5">
            {/* Google */}
            <div className="group relative">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff5500] to-[#ffaa00] rounded-lg opacity-0 group-hover:opacity-75 transition duration-500 blur-sm"></div>
               <div className="relative bg-[#1a1512] border border-[#2a1a12] p-6 rounded-lg hover:bg-[#201a15] transition-colors">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-white font-medium flex items-center gap-2">
                        Institutional Access
                     </span>
                     <span className="text-[10px] uppercase bg-[#ff5500]/10 text-[#ff5500] px-2 py-0.5 rounded border border-[#ff5500]/20">Recommended</span>
                  </div>
                  <div className="flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Login Failed')}
                        theme="filled_black"
                        shape="rect"
                        width="300"
                    />
                  </div>
               </div>
            </div>

            <div className="relative py-2 flex items-center justify-center">
               <div className="h-[1px] bg-[#1a1512] w-full absolute"></div>
               <span className="bg-[#0a0806] px-3 text-xs text-gray-600 font-mono relative z-10">OR CONNECT WALLET</span>
            </div>

            {/* Wallet */}
            <div className="bg-[#1a1512] border border-[#2a1a12] p-6 rounded-lg hover:border-[#ff5500]/30 transition-colors flex flex-col items-center gap-3">
               <div className="text-center mb-1">
                 <span className="text-white font-medium block">Web3 Connection</span>
                 <span className="text-xs text-gray-500 block">Sign transactions & claim rewards</span>
               </div>
               <ConnectButton 
                  label="Connect Wallet"
                  accountStatus="address"
                  chainStatus="icon"
                  showBalance={false}
               />
            </div>
          </div>

          <div className="mt-8 text-center">
            <a href="#" className="text-xs text-gray-500 hover:text-[#ff5500] transition-colors flex items-center justify-center gap-1 group">
               Create a new account <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="absolute bottom-8 text-center w-full z-10">
           <p className="text-[10px] text-gray-600 font-mono">
              SECURE_CONNECTION // {new Date().getFullYear()} OPPFORGE
           </p>
        </div>
      </div>

    </div>
  );
}
