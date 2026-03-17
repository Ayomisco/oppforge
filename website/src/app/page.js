'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Menu, X, Rocket, Check, Crosshair, Brain, Radio, Shield, Users, Flame, Sparkles, ChevronRight, Globe, Layers, Activity } from 'lucide-react'
import PricingSection from '@/components/PricingSection'

/* ═══════════════════════════════════════
   ORBITAL COMMAND — Website Landing Page
   Deep space indigo · Syne + DM Sans
   Maximalist with animated gradients
   ═══════════════════════════════════════ */

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const numTarget = parseFloat(target)
    const steps = 60
    const increment = numTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numTarget) {
        setCount(numTarget)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current * 10) / 10)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{Number.isInteger(parseFloat(target)) ? Math.floor(count) : count.toFixed(1)}{suffix}</span>
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#use-cases', label: 'Use Cases' },
    { href: '#how-it-works', label: 'Architecture' },
    { href: '#pricing', label: 'Pricing' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--bg-canvas)]/90 backdrop-blur-xl border-b border-[var(--border-default)]' : ''}`}>
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/oppforge_logo.png" alt="OppForge" className="w-8 h-8 rounded shrink-0 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors font-[family-name:var(--font-heading)]">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--accent-violet)] group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="https://app.oppforge.xyz" className="btn btn-primary group">
            Launch App <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <button className="md:hidden text-[var(--text-primary)] p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border-default)] overflow-hidden">
            <div className="container py-6 flex flex-col gap-4">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)} className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{l.label}</Link>
              ))}
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center mt-2">Launch App</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    viewport={{ once: true, margin: '-50px' }}
    className="glass-card p-7 flex flex-col gap-5 group"
  >
    <div className="w-12 h-12 rounded-xl bg-[var(--accent-violet-muted)] flex items-center justify-center text-[var(--accent-violet)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-bold text-[var(--text-primary)] font-[family-name:var(--font-heading)]">{title}</h3>
    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">{description}</p>
  </motion.div>
)

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-[var(--bg-canvas)] relative">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section ref={heroRef} className="relative py-28 md:py-40 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 grid-pattern" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-screen">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4" />
        </video>
        
        {/* Floating orbs */}
        <div className="orb orb-violet w-[600px] h-[600px] -top-40 -left-40" />
        <div className="orb orb-orange w-[400px] h-[400px] top-20 right-[-10%]" />
        <div className="orb orb-gold w-[500px] h-[500px] bottom-[-20%] left-[30%]" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-canvas)]/30 to-[var(--bg-canvas)] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container relative z-10 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
            {/* Status badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent-violet)]/20 mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-violet)] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-violet)]" />
              </span>
              <span className="text-xs font-medium text-[var(--text-secondary)]">v1.0 Public Beta — Now Live</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[1.05] mb-8 tracking-tight font-[family-name:var(--font-heading)]">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="block">
                Every Web3
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="block">
                Opportunity.
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-gradient-shift block">
                One Platform.
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              AI agents monitor <span className="text-[var(--accent-primary)] font-medium">hundreds of platforms 24/7</span> — scoring grants, hackathons, bounties, testnets, and every alpha opportunity so you never miss out.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.oppforge.xyz" className="btn btn-primary text-base px-10 py-4 w-full sm:w-auto group">
                Launch Mission Control <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary text-base px-10 py-4 w-full sm:w-auto">
                View Architecture
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-24 p-8 bg-[var(--bg-secondary)]/60 backdrop-blur-md border border-[var(--border-default)] rounded-2xl">
            {[
              { value: '50', suffix: '+', label: 'Supported Chains' },
              { value: '0.4', suffix: 's', label: 'Scan Latency' },
              { value: '50', suffix: 'M+', label: 'Tracked Value ($)' },
              { value: '98', suffix: '%', label: 'AI Accuracy' },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient-shift font-[family-name:var(--font-heading)] mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="orb orb-violet w-[400px] h-[400px] top-0 right-[-10%] opacity-50" />
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[var(--accent-violet)] text-xs font-medium uppercase tracking-widest mb-4">
              <Activity size={14} /> Intelligence Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight font-[family-name:var(--font-heading)]">
              Intelligence &<br />Verifiable Alpha
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              AI agents monitor trusted platforms, scoring opportunities out of 100 and generating winning proposals — so you only see what matters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Radio, title: 'Autonomous Monitoring', description: 'AI agents scan official blogs, X, and ecosystem forums. High-signal alpha surfaced the second it drops.' },
              { icon: Crosshair, title: 'Personalized Scoring', description: 'Opportunities ranked for your technical stack — Rust, Solidity, Python — and preferred ecosystems.' },
              { icon: Brain, title: 'Forge AI Assistant', description: 'Context-aware chat. Draft grant proposals, get farming plans, or receive architecture advice instantly.' },
              { icon: Shield, title: 'Risk Verification', description: 'Every opportunity is verified for legitimacy. Red flags get flagged before you invest your time.' },
              { icon: Layers, title: 'Multi-Chain Coverage', description: '50+ chains tracked. From Ethereum and Solana to emerging L2s — nothing escapes the scanner.' },
              { icon: Globe, title: 'Real-Time Alerts', description: 'Sub-5s notifications when a high-match opportunity appears. Never miss a deadline again.' },
            ].map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <PricingSection />

      {/* ═══ Use Cases ═══ */}
      <section id="use-cases" className="py-28 relative overflow-hidden">
        <div className="orb orb-orange w-[500px] h-[500px] bottom-0 left-[-15%] opacity-30" />
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[var(--accent-primary)] text-xs font-medium uppercase tracking-widest mb-4">
              <Users size={14} /> Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight font-[family-name:var(--font-heading)]">
              Who Forges With Us?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              An unfair advantage for every corner of Web3.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🐛', title: 'Bounty Hunters', sub: 'Bug Bounties · Dev Tasks', desc: 'Get pinged the second a bounty matches your stack.', accent: '#34D399' },
              { icon: '⚡', title: 'Hackathon Devs', sub: 'ETHGlobal · Superteam', desc: 'Discover under-the-radar hackathons. AI drafts winning submissions.', accent: 'var(--accent-primary)' },
              { icon: '🧪', title: 'Testnet Degens', sub: 'Airdrops · Node Running', desc: 'Risk AI verifies protocols before you sign a transaction.', accent: 'var(--accent-violet)' },
              { icon: '🏛️', title: 'Ecosystem DAOs', sub: 'Grants · Governance', desc: 'Track grant volumes across chains and structure proposals.', accent: 'var(--accent-gold)' },
              { icon: '📣', title: 'Community Managers', sub: 'Growth · Ops', desc: 'Find protocols granting funds for community growth roles.', accent: '#A78BFA' },
              { icon: '⭐', title: 'Web3 Ambassadors', sub: 'DevRel · Brand Programs', desc: 'Discover ambassador programs early. AI drafts applications.', accent: '#F472B6' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-7 group"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-0.5 font-[family-name:var(--font-heading)]">{item.title}</h3>
                <p className="text-[10px] uppercase font-medium tracking-[0.2em] mb-3" style={{ color: item.accent }}>{item.sub}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        <div className="orb orb-gold w-[500px] h-[500px] top-[-10%] right-[-5%] opacity-30" />
        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 text-[var(--accent-gold)] text-xs font-medium uppercase tracking-widest mb-4">
                <Sparkles size={14} /> How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight font-[family-name:var(--font-heading)]">Built for Hunters,<br />by Hunters.</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Connect Your Profile', desc: 'Tell OppForge your skills (Rust, Solidity, Design) and preferred chains.' },
                  { step: '02', title: 'Receive Curated Alpha', desc: 'Get a personalized feed of high-probability opportunities, filtered by AI.' },
                  { step: '03', title: 'Execute & Win', desc: 'Use the AI assistant to draft proposals and track your applications to completion.' },
                ].map((item, i) => (
                  <motion.div key={item.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                    className="flex gap-6 group">
                    <div className="text-4xl font-bold text-[var(--accent-violet)]/20 font-[family-name:var(--font-heading)] shrink-0 group-hover:text-[var(--accent-violet)]/60 transition-colors duration-300">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-[family-name:var(--font-heading)]">{item.title}</h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Terminal Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:w-1/2 w-full">
              <div className="glass-card overflow-hidden shadow-[var(--shadow-xl)]">
                <div className="bg-[var(--bg-tertiary)] h-10 flex items-center px-4 gap-2 border-b border-[var(--border-default)]">
                  <div className="w-3 h-3 rounded-full bg-[#F87171]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#FBBF24]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#34D399]/50" />
                  <span className="ml-3 text-xs text-[var(--text-tertiary)] font-mono">forge_agent v1.0</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-4">
                  <div className="text-[var(--text-tertiary)]">
                    $ initializing forge_agent... <span className="text-[var(--status-success)]">done</span>
                  </div>
                  <div>
                    <span className="text-[var(--accent-violet)]">➜</span> <span className="text-[var(--text-primary)]">scan --target solana --type grant</span>
                  </div>
                  <div className="text-[var(--text-tertiary)]">
                    <span className="text-[var(--status-info)]">INFO</span> Scanning 14 sources...<br />
                    <span className="text-[var(--status-info)]">INFO</span> Found 3 matches for &apos;Rust Developer&apos;:
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Solana Foundation Data Grant', match: '98%', color: 'var(--accent-primary)' },
                      { name: 'Superteam Radar Hackathon', match: '85%', color: 'var(--accent-violet)' },
                      { name: 'Anza Validator Program', match: 'New!', color: 'var(--status-success)' },
                    ].map(item => (
                      <div key={item.name} className="p-3 bg-[var(--bg-canvas)]/50 border border-[var(--border-muted)] rounded-lg flex justify-between items-center hover:border-[var(--accent-violet)]/30 cursor-pointer transition-all duration-200">
                        <span className="text-[var(--text-secondary)]">{item.name}</span>
                        <span style={{ color: item.color }} className="font-bold">{item.match}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 md:py-40 relative overflow-hidden">
        <div className="orb orb-violet w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[300px] h-[300px] bottom-0 right-[10%] opacity-30" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight font-[family-name:var(--font-heading)]">
              Ready to<br />
              <span className="text-gradient-shift">Forge Your Future?</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the elite builders capturing Web3 opportunities everyone else is missing.
            </p>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary text-lg px-12 py-5 group">
              Launch Platform <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="mt-8 text-sm text-[var(--text-tertiary)]">
              No credit card required · Open Source · Built for Web3
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 border-t border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <img src="/oppforge_logo.png" alt="" className="w-5 h-5 rounded opacity-50" />
            © {new Date().getFullYear()} OppForge. Open Source (MIT).
          </div>
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
