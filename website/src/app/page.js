'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Menu, X, Rocket, ChevronDown } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/oppforge_logo.png" alt="OppForge" className="w-8 h-8 rounded shrink-0 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <Link href="https://app.oppforge.xyz" className="btn btn-primary shadow-[0_0_16px_rgba(255,85,0,0.25)]">
            Launch App <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden text-[var(--text-primary)] p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return isVisible ? (
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--accent-primary)]"
    >
      <ChevronDown size={24} />
    </motion.div>
  ) : null
}

export default function LandingPage() {
  return (
    <div className="flex flex-col relative">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--accent-primary)]/[0.08] blur-[120px] rounded-full -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--accent-violet)]/[0.08] blur-[120px] rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container relative z-10 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-medium mb-12"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]" />
              </span>
              v1.0 Public Beta is Live
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] mb-8 tracking-tighter">
              Every Web3<br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-gold)] bg-clip-text text-transparent">Opportunity</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-gold)] blur-sm -z-10" />
              </span>
              <br />in One Command.
            </h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-2xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              AI agents monitor hundreds of platforms. You get grants, hackathons, bounties, and airdrops before anyone else knows they exist.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="https://app.oppforge.xyz"
                className="btn btn-primary text-lg px-10 py-4 w-full sm:w-auto shadow-[0_0_32px_rgba(255,85,0,0.3)] hover:shadow-[0_0_48px_rgba(255,85,0,0.5)] transition-all duration-300 hover:scale-105"
              >
                Launch Mission Control <Rocket size={20} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-20 flex justify-center gap-12 md:gap-20 text-center"
            >
              <div>
                <div className="text-3xl md:text-4xl font-black text-[var(--accent-primary)] font-mono">50+</div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mt-2">Chains</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-[var(--accent-secondary)] font-mono">24/7</div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mt-2">Monitoring</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-[var(--accent-gold)] font-mono">98%</div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mt-2">Accuracy</div>
              </div>
            </motion.div>
          </motion.div>

          <ScrollIndicator />
        </div>
      </section>

      {/* ═══ EXPERIENCE ═══ */}
      <section className="relative py-32 border-t border-[var(--border-default)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/[0.03] to-transparent pointer-events-none" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center tracking-tight">
              One Command. Infinite Alpha.
            </h2>

            {/* Terminal */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(255,85,0,0.1)]">
              <div className="bg-[var(--bg-tertiary)] h-12 flex items-center px-6 gap-3 border-b border-[var(--border-default)]">
                <div className="w-3 h-3 rounded-full bg-[var(--status-danger)]/60" />
                <div className="w-3 h-3 rounded-full bg-[var(--status-warning)]/60" />
                <div className="w-3 h-3 rounded-full bg-[var(--status-success)]/60" />
                <span className="ml-4 text-xs text-[var(--text-tertiary)] font-mono">forge_agent.terminal</span>
              </div>
              <div className="p-8 font-mono text-sm space-y-4 min-h-96">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-[var(--text-tertiary)]"
                >
                  $ forge scan --target solana --type grant
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-[var(--status-info)]"
                >
                  ➜ Scanning 47 sources across Solana ecosystem...
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  {[
                    { title: 'Solana Foundation Grants', match: '98%', status: 'ACTIVE' },
                    { title: 'Marinade Native Staking Hackathon', match: '94%', status: 'NEW' },
                    { title: 'Superteam DAO Bounties', match: '88%', status: 'LIVE' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-4 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg hover:border-[var(--accent-primary)]/30 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="text-[var(--text-primary)] font-semibold">{item.title}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">match_score: {item.match} | status: {item.status}</div>
                      </div>
                      <div className="text-[var(--accent-primary)] font-bold text-lg">{item.match}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  viewport={{ once: true }}
                  className="text-[var(--status-success)] pt-4 border-t border-[var(--border-muted)]"
                >
                  ✓ 3 opportunities matched | Ready to forge applications
                </motion.div>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              viewport={{ once: true }}
              className="text-center mt-10 text-[var(--text-secondary)] text-sm"
            >
              This is real. No marketing fluff. Just pure scanning, scoring, and delivery of opportunities your competitors miss.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-32 border-t border-[var(--border-default)] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/[0.06] blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8">Build Your Edge</h2>
            <p className="text-lg text-[var(--text-secondary)] mb-12 max-w-xl mx-auto">
              Stop missing opportunities. Start winning grants and airdrops. Your unfair advantage in Web3 starts now.
            </p>
            <Link
              href="https://app.oppforge.xyz"
              className="btn btn-primary text-lg px-12 py-4 shadow-[0_0_40px_rgba(255,85,0,0.3)] hover:shadow-[0_0_60px_rgba(255,85,0,0.5)] transition-all duration-300 inline-flex hover:scale-105"
            >
              Launch Platform <ArrowRight size={20} />
            </Link>
            <div className="mt-8 text-sm text-[var(--text-tertiary)]">
              No credit card · Open Source · Built for Web3
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-8 border-t border-[var(--border-default)] bg-[var(--bg-primary)]/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-tertiary)]">
          <div>© {new Date().getFullYear()} OppForge. Open Source (MIT).</div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <Link href="https://x.com/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">X</Link>
            <Link href="https://t.me/opp_forge" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">Telegram</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
