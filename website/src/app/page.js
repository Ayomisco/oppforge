'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Menu, X, Rocket, Search, Zap, ShieldCheck } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/oppforge_logo.png" alt="OppForge" className="w-8 h-8 rounded shrink-0 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </Link>
          <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </Link>
          <Link href="https://app.oppforge.xyz" className="ml-2 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:shadow-[0_0_32px_rgba(255,85,0,0.5)] hover:scale-[1.03] transition-all duration-300">
            Launch App <ArrowRight size={15} />
          </Link>
        </div>
        <button className="md:hidden text-white/80 p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-black/60 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden">
            <div className="px-6 py-5 flex flex-col gap-4">
              <Link href="https://x.com/opp_forge" onClick={() => setIsOpen(false)} className="text-base text-white/50 hover:text-white">X (Twitter)</Link>
              <Link href="https://t.me/opp_forge" onClick={() => setIsOpen(false)} className="text-base text-white/50 hover:text-white">Telegram</Link>
              <Link href="https://app.oppforge.xyz" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white">Launch App <ArrowRight size={15} /></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />

      {/* ═══ Hero — Full Screen ═══ */}
      <section className="flex-1 flex items-center justify-center relative min-h-screen overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        {/* Radial overlay to frame the bg image center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(6,6,15,0.6)_60%,rgba(6,6,15,0.92)_100%)] pointer-events-none z-[1]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#ff5500] text-xs font-medium mb-10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5500] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffaa00]" />
              </span>
              v1.0 Public Beta is Live
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.95] mb-8 tracking-[-0.04em]">
              <span className="block text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Every Opportunity.</span>
              <span className="block bg-gradient-to-r from-[#ff5500] via-[#ffaa00] to-[#ff5500] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease_infinite] drop-shadow-[0_2px_10px_rgba(255,85,0,0.3)]">
                One Platform.
              </span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-lg sm:text-xl text-white/60 mb-12 max-w-xl mx-auto leading-relaxed font-light drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              AI agents scan <span className="text-white/90 font-medium">hundreds of platforms</span> to surface grants, hackathons, bounties, airdrops, ambassador programs, testnets, content deals, and more — scored and verified for you.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
              <Link href="https://app.oppforge.xyz" className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-[#ff5500] to-[#ff3333] text-white shadow-[0_0_40px_rgba(255,85,0,0.3),0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_rgba(255,85,0,0.45),0_4px_30px_rgba(0,0,0,0.4)] hover:scale-[1.04] transition-all duration-300">
                Launch Mission Control <Rocket size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating capability pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-20 flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
            {[
              { icon: Search, text: 'AI Discovery' },
              { icon: Zap, text: 'Smart Scoring' },
              { icon: ShieldCheck, text: 'Risk Verified' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/40 text-xs font-medium backdrop-blur-sm"
              >
                <item.icon size={13} className="text-white/25" />
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer — Minimal ═══ */}
      <footer className="relative z-10 py-6 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/25">
          <div>© {new Date().getFullYear()} OppForge</div>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">X</Link>
            <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Telegram</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
