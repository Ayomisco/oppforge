'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { loginWithGoogle } = useAuth()

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] relative overflow-hidden px-4">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/oppforge_logo.png"
            alt="OppForge"
            width={48}
            height={48}
            className="mb-4 drop-shadow-[0_0_16px_rgba(255,85,0,0.3)]"
            priority
          />
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Sign in to OppForge
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your Web3 command center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          {/* Google — Primary */}
          <button
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-lg text-sm transition-all hover:bg-gray-100 active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          {/* X (Twitter) */}
          <button
            onClick={handleXLogin}
            className="w-full mt-3 flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium py-3 px-4 rounded-lg text-sm border border-[var(--border-default)] transition-all hover:bg-[var(--bg-overlay)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Continue with X
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          {/* Wallet */}
          <div className="bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg p-4 flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Web3 Wallet</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Connect to claim on-chain rewards</p>
            </div>
            <ConnectButton
              label="Connect Wallet"
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'AI-Verified', sub: 'Opportunities' },
            { label: '50+ Chains', sub: 'Monitored' },
            { label: 'Free Trial', sub: '7 days' },
          ].map(item => (
            <div key={item.label} className="text-center py-2.5 px-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
              <div className="text-xs font-medium text-[var(--text-primary)]">{item.label}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          © {new Date().getFullYear()} OppForge · Secure Connection
        </p>
      </motion.div>
    </div>
  )
}
