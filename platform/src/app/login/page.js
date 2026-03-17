'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useGoogleLogin } from '@react-oauth/google'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { loginGoogle, loginWallet, user } = useAuth()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const loginAttempted = useRef(false)

  const handleWalletLogin = useCallback(async (walletAddress) => {
    try {
      const message = `Sign in to OppForge\nAddress: ${walletAddress}\nTimestamp: ${Date.now()}`
      const signature = await signMessageAsync({ message })
      const result = await loginWallet(walletAddress, signature, message)
      if (result?.success) {
        if (result.isNewUser) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }
    } catch {
      loginAttempted.current = false
    }
  }, [signMessageAsync, loginWallet, router])

  useEffect(() => {
    if (isConnected && address && !user && !loginAttempted.current) {
      loginAttempted.current = true
      handleWalletLogin(address)
    }
  }, [isConnected, address, user, handleWalletLogin])

  const handleGoogleSuccess = async (response) => {
    if (response.access_token) {
      const result = await loginGoogle({ credential: response.access_token })
      if (result?.success) {
        router.push('/dashboard')
      }
    }
  }

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed'),
  })

  const handleXLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID
    if (!clientId) {
      toast.error('X authentication not configured yet')
      return
    }
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/[+/=]/g, c => c === '+' ? '-' : c === '/' ? '_' : '')
      .slice(0, 64)
    const state = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
      .replace(/[+/=]/g, '')
      .slice(0, 32)

    sessionStorage.setItem('x_code_verifier', codeVerifier)
    sessionStorage.setItem('x_oauth_state', state)

    const encoder = new TextEncoder()
    crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier)).then(hash => {
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
      const redirectUri = `${window.location.origin}/auth/x/callback`
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'tweet.read users.read offline.access',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })
      window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0A0908 0%, #12100D 45%, #0D0B09 100%)' }}>
      {/* Animated mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full top-[-15%] right-[-10%] opacity-[0.07]" 
          style={{ background: 'radial-gradient(circle, #ff5500, transparent 70%)', animation: 'pulse-slow 8s ease-in-out infinite' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-[-10%] left-[-10%] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #ffaa00, transparent 70%)', animation: 'pulse-slow 12s ease-in-out infinite reverse' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full top-[40%] left-[50%] -translate-x-1/2 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #ff5500, transparent 70%)', animation: 'pulse-slow 10s ease-in-out infinite 2s' }} />
      </div>

      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="w-full max-w-[360px] relative z-10 px-6">
        {/* Logo + Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center mb-12"
        >
          <Image
            src="/oppforge_logo.png"
            alt="OppForge"
            width={48}
            height={48}
            className="mb-4 drop-shadow-[0_0_20px_rgba(255,85,0,0.15)]"
            priority
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            OppForge
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1.5 tracking-wide">
            Your Web3 command center
          </p>
        </motion.div>

        {/* Auth Options — No card, just stacked with spacing */}
        <div className="space-y-3">
          {/* Google */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => triggerGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.95] hover:bg-white text-gray-900 font-medium py-3.5 px-4 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_24px_rgba(255,255,255,0.08)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>

          {/* X */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={handleXLogin}
            className="w-full flex items-center justify-center gap-3 bg-[var(--text-primary)] hover:bg-white text-[#0A0908] font-medium py-3.5 px-4 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_24px_rgba(255,255,255,0.06)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Continue with X
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex items-center gap-4 py-2"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />
            <span className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />
          </motion.div>

          {/* Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full bg-[var(--bg-secondary)]/40 backdrop-blur-sm border border-[var(--border-default)] rounded-xl p-4 flex flex-col items-center gap-3 hover:border-[var(--accent-primary)]/20 transition-colors duration-300"
          >
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-[var(--accent-primary)]" />
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">Web3 Wallet</p>
            </div>
            <ConnectButton
              label="Connect Wallet"
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center text-[11px] text-[var(--text-tertiary)] mt-10 tracking-wide"
        >
          &copy; {new Date().getFullYear()} OppForge &middot; Secure Connection
        </motion.p>

        <style jsx>{`
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.07; }
            50% { transform: scale(1.15); opacity: 0.12; }
          }
        `}</style>
      </div>
    </div>
  )
}
