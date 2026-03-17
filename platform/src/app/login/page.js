'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useGoogleLogin } from '@react-oauth/google'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { loginGoogle } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/images/login-hero.png"
        alt=""
        fill
        className="object-cover opacity-15"
        priority
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[var(--bg-canvas)]/80" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10 px-4"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/oppforge_logo.png"
            alt="OppForge"
            width={44}
            height={44}
            className="mb-3"
            priority
          />
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Sign in to OppForge
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your Web3 command center
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-[var(--border-default)] rounded-xl p-6">
          {/* Google */}
          <button
            onClick={() => triggerGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-lg text-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* X */}
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
          <div className="bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg p-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-[#ff5500]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Web3 Wallet</p>
            </div>
            <ConnectButton
              label="Connect Wallet"
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          &copy; {new Date().getFullYear()} OppForge &middot; Secure Connection
        </p>
      </motion.div>
    </div>
  )
}
