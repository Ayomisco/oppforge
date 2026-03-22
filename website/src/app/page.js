'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/oppforge_logo.png" alt="OppForge" className="w-7 h-7 rounded shrink-0 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-base tracking-tight text-white/80 group-hover:text-white transition-colors">OppForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer"
            className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg hover:bg-white/[0.04]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </Link>
          <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer"
            className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg hover:bg-white/[0.04]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </Link>
          <Link href="https://app.oppforge.xyz"
            className="ml-2 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white shadow-[0_0_20px_rgba(255,85,0,0.25)] hover:shadow-[0_0_32px_rgba(255,85,0,0.45)] hover:scale-[1.03] transition-all duration-300">
            Launch App <ArrowRight size={14} />
          </Link>
        </div>

        <button className="md:hidden text-white/60 p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/70 backdrop-blur-xl border-t border-white/[0.05] overflow-hidden">
            <div className="px-6 py-5 flex flex-col gap-4">
              <Link href="https://x.com/opp_forge" onClick={() => setIsOpen(false)} className="text-sm text-white/40 hover:text-white transition-colors">X (Twitter)</Link>
              <Link href="https://t.me/opp_forge" onClick={() => setIsOpen(false)} className="text-sm text-white/40 hover:text-white transition-colors">Telegram</Link>
              <Link href="https://app.oppforge.xyz" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white">
                Launch App <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#06060F]">
      <Navbar />

      {/* ═══ Background Composition ═══ */}
      <div className="fixed inset-0 pointer-events-none">

        {/* Grid */}
        <div className="absolute inset-0 grid-pattern opacity-100" />

        {/* Violet orb — top left */}
        <div className="orb orb-violet absolute w-[700px] h-[700px] -top-60 -left-40 opacity-90" />

        {/* Orange orb — bottom right */}
        <div className="orb orb-orange absolute w-[600px] h-[600px] -bottom-40 -right-20 opacity-100" />

        {/* Gold orb — center top */}
        <div className="orb orb-gold absolute w-[400px] h-[400px] top-10 left-1/2 -translate-x-1/2 opacity-60" />

        {/* Central forge radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.04) 0%, rgba(124,58,237,0.03) 40%, transparent 70%)' }}
        />

        {/* Orbit ring 1 — inner, dashed violet */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          orbit orbit-spin"
          style={{
            width: 'min(420px, 55vw)',
            height: 'min(420px, 55vw)',
            borderWidth: '1px',
            borderColor: 'rgba(124,58,237,0.10)',
            borderStyle: 'dashed',
          }}
        />

        {/* Orbit ring 2 — mid, solid orange-tinted */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          orbit orbit-rev"
          style={{
            width: 'min(640px, 75vw)',
            height: 'min(640px, 75vw)',
            borderWidth: '1px',
            borderColor: 'rgba(255,85,0,0.06)',
          }}
        />

        {/* Orbit ring 3 — outer, very faint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          orbit orbit-spin2"
          style={{
            width: 'min(860px, 90vw)',
            height: 'min(860px, 90vw)',
            borderWidth: '1px',
            borderColor: 'rgba(124,58,237,0.04)',
            borderStyle: 'dashed',
          }}
        />

        {/* Forge point — center star */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 forge-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff5500]"
            style={{ boxShadow: '0 0 0 8px rgba(255,85,0,0.06), 0 0 40px 12px rgba(255,85,0,0.12)' }}
          />
        </div>

        {/* Scattered node dots */}
        <div className="absolute top-[22%] left-[18%] w-1 h-1 rounded-full bg-violet-500/25" style={{ boxShadow: '0 0 6px 2px rgba(124,58,237,0.15)' }} />
        <div className="absolute top-[38%] right-[22%] w-0.5 h-0.5 rounded-full bg-orange-500/40" />
        <div className="absolute bottom-[30%] left-[28%] w-0.5 h-0.5 rounded-full bg-violet-400/30" />
        <div className="absolute top-[60%] right-[30%] w-1 h-1 rounded-full bg-orange-500/20" style={{ boxShadow: '0 0 8px 2px rgba(255,85,0,0.10)' }} />
        <div className="absolute top-[15%] right-[38%] w-0.5 h-0.5 rounded-full bg-amber-400/25" />
      </div>

      {/* ═══ Hero ═══ */}
      <section className="flex-1 flex items-center justify-center relative min-h-screen">
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6 pt-16">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[#ffaa00] text-[11px] font-medium mb-12 tracking-wider uppercase"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5500] opacity-70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ffaa00]" />
            </span>
            v1.0 · Beta Live
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading font-bold leading-[0.92] tracking-[-0.04em] mb-8"
          >
            <span className="block text-5xl sm:text-7xl md:text-[88px] text-white">
              Every
            </span>
            <span className="block text-5xl sm:text-7xl md:text-[88px] text-gradient-shift">
              Opportunity.
            </span>
            <span className="block text-5xl sm:text-7xl md:text-[88px] text-white/30 mt-2">
              One Platform.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[15px] text-white/35 mb-12 tracking-wide font-light"
          >
            AI-powered discovery. Scored. Verified. Yours.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            <Link href="https://app.oppforge.xyz"
              className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white shadow-[0_0_40px_rgba(255,85,0,0.25)] hover:shadow-[0_0_60px_rgba(255,85,0,0.4)] hover:scale-[1.04] transition-all duration-300"
            >
              Launch Mission Control
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Capability pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-2"
          >
            {['Grants', 'Hackathons', 'Bounties', 'Airdrops', 'Testnets'].map((label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.08 }}
                className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest text-white/20 border border-white/[0.05] bg-white/[0.02]"
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 py-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-white/20 tracking-widest uppercase font-mono">
          <div>© {new Date().getFullYear()} OppForge</div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">X</Link>
            <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Telegram</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
