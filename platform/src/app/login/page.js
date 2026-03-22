'use client'

import React, { useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useGoogleLogin } from '@react-oauth/google'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

function LoginPageInner() {
  const { loginGoogle, loginWallet, user } = useAuth()
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const handleGoogleSuccess = async (response) => {
    if (response.access_token) {
      const result = await loginGoogle({ credential: response.access_token })
      if (result?.success) router.push(result.isNewUser ? '/onboarding' : returnTo)
    }
  }

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed'),
  })

  useEffect(() => {
    if (isConnected && address && !user) {
      loginWallet(address).then(result => {
        if (result?.success) router.push(result.isNewUser ? '/onboarding' : returnTo)
      })
    }
  }, [isConnected, address, user, loginWallet, router, returnTo])

  const handleXLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID
    if (!clientId) { toast.error('X authentication not configured yet'); return }
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/[+/=]/g, c => c === '+' ? '-' : c === '/' ? '_' : '')
      .slice(0, 64)
    const state = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
      .replace(/[+/=]/g, '').slice(0, 32)
    sessionStorage.setItem('x_code_verifier', codeVerifier)
    sessionStorage.setItem('x_oauth_state', state)
    if (returnTo !== '/dashboard') sessionStorage.setItem('x_return_to', returnTo)
    const encoder = new TextEncoder()
    crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier)).then(hash => {
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      const redirectUri = `${window.location.origin}/auth/x/callback`
      const params = new URLSearchParams({
        response_type: 'code', client_id: clientId, redirect_uri: redirectUri,
        scope: 'tweet.read users.read offline.access', state,
        code_challenge: codeChallenge, code_challenge_method: 'S256',
      })
      window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060609] flex flex-col">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Faint grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        {/* Violet corner — top left (the cold) */}
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />

        {/* Orange corner — bottom right (the forge fire) */}
        <div className="absolute -bottom-32 -right-24 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.14) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />

        {/* Subtle center warmth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,170,0,0.03) 0%, transparent 60%)' }}
        />

        {/* Scattered node dots */}
        <div className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full bg-violet-500/30"
          style={{ boxShadow: '0 0 8px 3px rgba(124,58,237,0.15)' }} />
        <div className="absolute top-[72%] right-[18%] w-1 h-1 rounded-full bg-orange-500/25"
          style={{ boxShadow: '0 0 8px 3px rgba(255,85,0,0.12)' }} />
        <div className="absolute top-[45%] right-[8%] w-0.5 h-0.5 rounded-full bg-violet-400/40" />
        <div className="absolute bottom-[25%] left-[12%] w-0.5 h-0.5 rounded-full bg-orange-400/30" />
        <div className="absolute top-[30%] right-[30%] w-0.5 h-0.5 rounded-full bg-amber-400/20" />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Link href="https://oppforge.xyz" className="flex items-center gap-2 group">
          <Image src="/oppforge_logo.png" alt="OppForge" width={26} height={26} priority className="group-hover:scale-110 transition-transform duration-300" />
          <span className="text-white/70 font-semibold text-sm tracking-wide uppercase group-hover:text-white transition-colors">OppForge</span>
        </Link>
        <a href="https://oppforge.xyz"
          className="text-white/25 text-[10px] tracking-widest uppercase hover:text-white/50 transition-colors font-mono">
          About
        </a>
      </header>

      {/* ── Auth panel ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[340px]"
        >
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5500]"
                style={{ boxShadow: '0 0 0 4px rgba(255,85,0,0.08), 0 0 20px 6px rgba(255,85,0,0.12)' }} />
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight mb-1.5">
              Access the Forge
            </h1>
            <p className="text-white/30 text-xs tracking-wide">
              Sign in to your command center
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

            {/* Google */}
            <button
              onClick={() => triggerGoogleLogin()}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-2.5 px-4 rounded-xl text-sm transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
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
              className="w-full mt-2.5 flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.09] text-white font-medium py-2.5 px-4 rounded-xl text-sm border border-white/[0.07] transition-all active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Continue with X
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Wallet */}
            <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">On-chain access</p>
              <ConnectButton
                label="Connect Wallet"
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </div>

          {/* Privacy / Terms */}
          <p className="text-center text-white/20 text-[10px] mt-5 leading-relaxed font-mono">
            By continuing you agree to our{' '}
            <a href="https://oppforge.xyz/privacy-policy"
              className="underline underline-offset-2 hover:text-white/50 transition-colors">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="https://oppforge.xyz/terms-of-service"
              className="underline underline-offset-2 hover:text-white/50 transition-colors">
              Terms of Service
            </a>
          </p>

          <p className="text-center text-white/15 text-[10px] mt-3 tracking-widest uppercase font-mono">
            7-day free trial · No credit card
          </p>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 sm:px-10 pb-6 flex items-center justify-between">
        <p className="text-white/15 text-[10px] tracking-widest uppercase font-mono">
          © {new Date().getFullYear()} OppForge
        </p>
        <p className="text-white/15 text-[10px] tracking-widest uppercase font-mono">
          Web3 Intelligence
        </p>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060609]" />}>
      <LoginPageInner />
    </Suspense>
  )
}
