'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Zap, Search, Menu, X, Rocket, Check, Bug, Code2, FlaskConical, Building2, Megaphone, Star, ShieldCheck, Crown } from 'lucide-react'
import PricingSection from '@/components/PricingSection'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/oppforge_logo.png" alt="OppForge" className="w-8 h-8 rounded shrink-0 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="#use-cases" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Use Cases</Link>
          <Link href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="https://app.oppforge.xyz" className="btn btn-primary shadow-[0_0_16px_rgba(255,85,0,0.25)]">
            Launch App <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden text-[var(--text-primary)] p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-b border-[var(--border-default)] bg-[var(--bg-primary)] overflow-hidden">
            <div className="container py-4 flex flex-col gap-4">
              <Link href="#features" onClick={() => setIsOpen(false)} className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Features</Link>
              <Link href="#use-cases" onClick={() => setIsOpen(false)} className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Use Cases</Link>
              <Link href="#how-it-works" onClick={() => setIsOpen(false)} className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]">How it Works</Link>
              <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Pricing</Link>
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center">Launch App</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }} className="glass-card p-6 flex flex-col gap-4 group hover:border-[var(--accent-primary)]/30 transition-colors">
    <div className="w-11 h-11 rounded-lg bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
      <Icon size={22} />
    </div>
    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{description}</p>
  </motion.div>
)

const Statistic = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-[var(--accent-primary)] font-mono mb-1">{value}</div>
    <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">{label}</div>
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-[var(--bg-canvas)] relative">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-[var(--border-default)]">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[var(--accent-primary)]/[0.06] blur-[140px] rounded-full pointer-events-none" />

        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--accent-primary)] text-xs font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]" />
              </span>
              v1.0 Public Beta is Live
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Forge Your Next<br />
              <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-gold)] bg-clip-text text-transparent">
                Web3 Opportunity
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover <span className="text-[var(--text-primary)] font-medium">Grants, Hackathons, Bounties, Testnets,</span> and <span className="text-[var(--text-primary)] font-medium">Early Alphas</span>. AI agents monitor trusted platforms 24/7, scoring and verifying every opportunity for{' '}
              <span className="text-[var(--accent-primary)] font-semibold">every Web3 builder</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.oppforge.xyz" className="btn btn-primary text-base px-8 py-3 w-full sm:w-auto shadow-[0_0_24px_rgba(255,85,0,0.25)] hover:shadow-[0_0_40px_rgba(255,85,0,0.4)]">
                Launch Mission Control <Rocket size={18} />
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary text-base px-8 py-3 w-full sm:w-auto">
                View Architecture
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 p-6 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl">
              <Statistic value="50+" label="Supported Chains" />
              <Statistic value="0.4s" label="Scan Latency" />
              <Statistic value="$50M+" label="Tracked Value" />
              <Statistic value="98%" label="AI Accuracy" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-24 border-b border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Intelligence & Verifiable Alpha</h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              OppForge uses AI agents to monitor trusted platforms, <span className="text-[var(--text-primary)]">scoring opportunities out of 100</span> and generating winning proposals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Search} title="Autonomous Monitoring" description="AI agents scan official blogs, X (Twitter), and ecosystem forums. High-signal alpha surfaced the second it drops." delay={0.1} />
            <FeatureCard icon={Zap} title="Personalized Scoring" description="Opportunities ranked for your technical stack — Rust, Solidity, Python — and preferred ecosystems." delay={0.2} />
            <FeatureCard icon={Terminal} title="Forge AI Assistant" description="Context-aware chat. Draft grant proposals, get farming plans, or receive architecture advice instantly." delay={0.3} />
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <PricingSection />

      {/* ═══ Use Cases ═══ */}
      <section id="use-cases" className="py-24 border-t border-[var(--border-default)] bg-[var(--bg-canvas)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Who Forges With Us?</h2>
            <p className="text-[var(--text-secondary)] text-lg">
              An unfair advantage for every part of Web3.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Bug, title: 'Bounty Hunters', sub: 'Bug Bounties · Dev Tasks', desc: 'Get pinged the second a bounty matches your stack.', color: 'var(--status-success)' },
              { icon: Code2, title: 'Hackathon Devs', sub: 'ETHGlobal · Superteam', desc: 'Discover under-the-radar hackathons. AI drafts winning submissions.', color: 'var(--accent-primary)' },
              { icon: FlaskConical, title: 'Testnet Degens', sub: 'Airdrops · Node Running', desc: 'Risk AI verifies protocols before you sign a transaction.', color: 'var(--status-info)' },
              { icon: Building2, title: 'Ecosystem DAOs', sub: 'Grants · Governance', desc: 'Track grant volumes across chains and structure proposals.', color: 'var(--accent-gold)' },
              { icon: Megaphone, title: 'Community Managers', sub: 'Growth · Ops', desc: 'Find protocols granting funds for community growth roles.', color: '#a855f7' },
              { icon: Star, title: 'Web3 Ambassadors', sub: 'DevRel · Brand Programs', desc: 'Discover ambassador programs early. AI drafts applications.', color: '#ec4899' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 hover:border-opacity-50 transition-all group"
                style={{ borderTopColor: item.color, borderTopWidth: '2px' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 border transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30`, color: item.color }}>
                  <item.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">{item.title}</h3>
                <p className="text-[10px] uppercase font-mono tracking-widest mb-3" style={{ color: item.color }}>{item.sub}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-24 border-t border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">Built for Hunters,<br />by Hunters.</h2>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Connect Your Profile', desc: 'Tell OppForge your skills (Rust, Solidity, Design) and preferred chains.' },
                  { step: '2', title: 'Receive Curated Alpha', desc: 'Get a personalized feed of high-probability opportunities, filtered by AI.' },
                  { step: '3', title: 'Execute & Win', desc: 'Use the AI assistant to draft proposals and track your applications.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-[var(--accent-primary-muted)] flex items-center justify-center shrink-0 text-[var(--accent-primary)] font-bold text-sm border border-[var(--accent-primary)]/20">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{item.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Preview */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-[var(--shadow-xl)]">
                <div className="bg-[var(--bg-tertiary)] h-9 flex items-center px-4 gap-2 border-b border-[var(--border-default)]">
                  <div className="w-3 h-3 rounded-full bg-[var(--status-danger)]/50" />
                  <div className="w-3 h-3 rounded-full bg-[var(--status-warning)]/50" />
                  <div className="w-3 h-3 rounded-full bg-[var(--status-success)]/50" />
                  <span className="ml-2 text-xs text-[var(--text-tertiary)] font-mono">forge_agent</span>
                </div>
                <div className="p-5 font-mono text-sm space-y-4">
                  <div className="text-[var(--text-tertiary)]">
                    $ initializing forge_agent... <span className="text-[var(--status-success)]">done</span>
                  </div>
                  <div>
                    <span className="text-[var(--accent-primary)]">➜</span> <span className="text-[var(--text-primary)]">scan --target solana --type grant</span>
                  </div>
                  <div className="text-[var(--text-tertiary)]">
                    <span className="text-[var(--status-info)]">INFO</span> Scanning 14 sources...<br />
                    <span className="text-[var(--status-info)]">INFO</span> Found 3 matches for &apos;Rust Developer&apos;:
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Solana Foundation Data Grant', match: '98%', color: 'var(--accent-primary)' },
                      { name: 'Superteam Radar Hackathon', match: '85%', color: 'var(--accent-secondary)' },
                      { name: 'Anza Validator Program', match: 'New!', color: 'var(--status-info)' },
                    ].map(item => (
                      <div key={item.name} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-md flex justify-between items-center hover:border-[var(--accent-primary)]/30 cursor-pointer transition-colors">
                        <span className="text-[var(--text-secondary)]">{item.name}</span>
                        <span style={{ color: item.color }} className="font-semibold">{item.match}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32 border-t border-[var(--border-default)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-primary)]/[0.04] blur-[100px] rounded-full pointer-events-none" />
        <div className="container text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Forge Your Future?</h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
            Join the elite builders capturing Web3 opportunities everyone else is missing.
          </p>
          <Link href="https://app.oppforge.xyz" className="btn btn-primary text-lg px-10 py-4 shadow-[0_0_32px_rgba(255,85,0,0.25)] hover:shadow-[0_0_48px_rgba(255,85,0,0.4)]">
            Launch Platform <ArrowRight size={20} />
          </Link>
          <div className="mt-6 text-sm text-[var(--text-tertiary)]">
            No credit card required · Open Source · Built for Web3
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-8 border-t border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <div>© {new Date().getFullYear()} OppForge. Open Source (MIT).</div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
