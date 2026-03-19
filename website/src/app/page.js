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
          <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors px-3 py-1.5">X</Link>
          <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors px-3 py-1.5">Telegram</Link>
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
        {/* Radial overlay to frame the bg image center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,6,15,0.7)_70%,rgba(6,6,15,0.95)_100%)] pointer-events-none z-[1]" />

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
              <span className="block text-white/95">Find Alpha.</span>
              <span className="block bg-gradient-to-r from-[#ff5500] via-[#ffaa00] to-[#ff5500] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease_infinite]">
                Win Big.
              </span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-lg sm:text-xl text-white/50 mb-12 max-w-lg mx-auto leading-relaxed font-light">
              AI agents scan <span className="text-white/80 font-medium">hundreds of platforms</span> to surface grants, hackathons, bounties, and airdrops — scored and verified for you.
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
