'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Zap, Search, Menu, X, Rocket, Check } from 'lucide-react'
import PricingSection from '@/components/PricingSection'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-espresso)]/80 backdrop-blur-md">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="OppForge" className="w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(255,85,0,0.3)] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-forge)] transition-colors">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className="btn btn-ghost text-sm">Log In</Link>
          <Link href="/dashboard" className="btn btn-primary text-sm">
            Launch App <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden text-[var(--text-primary)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-espresso)] overflow-hidden">
            <div className="container py-4 flex flex-col gap-4">
              <Link href="#features" className="text-base font-medium text-[var(--text-secondary)]">Features</Link>
              <Link href="#how-it-works" className="text-base font-medium text-[var(--text-secondary)]">How it Works</Link>
              <Link href="/dashboard" className="btn btn-primary w-full justify-center">Launch App</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }} className="glass-card p-6 flex flex-col gap-4 group hover:bg-[var(--bg-walnut)] transition-colors">
    <div className="w-12 h-12 rounded-lg bg-[var(--bg-mahogany)] flex items-center justify-center text-[var(--accent-forge)] group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{description}</p>
  </motion.div>
)

const Statistic = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-[var(--accent-forge)] font-mono mb-1">{value}</div>
    <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">{label}</div>
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[var(--header-height)] bg-[var(--bg-espresso)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A1410] via-[#0D0A07] to-[#0D0A07]">
      <div className="scanlines" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-forge)]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-walnut)] border border-[var(--accent-forge)]/30 text-[var(--accent-forge)] text-xs font-mono mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-forge)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-forge)]"></span>
              </span>
              v1.0 Public Beta Live
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Forge Your Next <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-forge)] via-[var(--accent-amber)] to-[var(--accent-gold)]">
                Web3 Opportunity
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
              The AI-powered agent that finds, scores, and helps you win grants, airdrops, and bounties before anyone else.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn btn-primary w-full sm:w-auto text-lg px-8 py-4">
                Start Hunting <Rocket size={20} />
              </Link>
              <Link href="#how-it-works" className="btn btn-ghost w-full sm:w-auto text-lg px-8 py-4 border border-[var(--border-subtle)]">
                View Architecture
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 p-6 glass-card border-[var(--border-subtle)]">
              <Statistic value="20+" label="Data Sources" />
              <Statistic value="0.4s" label="Scan Latency" />
              <Statistic value="$50M+" label="Tracked Value" />
              <Statistic value="100%" label="AI Powered" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[var(--bg-walnut)]/30 relative">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligence, Not Just Data</h2>
            <p className="text-[var(--text-secondary)]">
              Most aggregators just list links. OppForge understands them, scores them, and tells you how to win.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Search} title="Autonomous Discovery" description="AI agents scan Twitter, Discord, and governance forums 24/7 to find hidden alpha before it goes viral." delay={0.1} />
            <FeatureCard icon={Zap} title="Real-Time Scoring" description="Every opportunity is scored (0-100) based on your specific skills, preferred chains, and historical win probability." delay={0.2} />
            <FeatureCard icon={Terminal} title="Forge AI Chat" description="Ask specific questions like 'Is this grant worth my time?' or 'Draft a proposal for this hackathon'." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Pricing Section - INJECTED HERE */}
      <PricingSection />

      {/* Interactive Terminal Demo Preview */}
      <section className="py-24 overflow-hidden">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Hunters, <br/> by Hunters.</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[var(--bg-mahogany)] flex items-center justify-center shrink-0 text-[var(--accent-forge)]">1</div>
                  <div><h3 className="text-xl font-bold mb-2">Connect Your Profile</h3><p className="text-[var(--text-secondary)]">Tell OppForge your skills (Rust, Solidity, Design) and preferred chains.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[var(--bg-mahogany)] flex items-center justify-center shrink-0 text-[var(--accent-forge)]">2</div>
                  <div><h3 className="text-xl font-bold mb-2">Receive Curated Alpha</h3><p className="text-[var(--text-secondary)]">Get a personalized feed of high-probability opportunities, filtered by AI.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[var(--bg-mahogany)] flex items-center justify-center shrink-0 text-[var(--accent-forge)]">3</div>
                  <div><h3 className="text-xl font-bold mb-2">Execute & Win</h3><p className="text-[var(--text-secondary)]">Use the AI assistant to draft proposals and track your applications.</p></div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
               {/* Mock UI Card */}
               <div className="glass-card p-1 border border-[var(--border-glow)] shadow-2xl shadow-[var(--accent-forge)]/10 rounded-xl overflow-hidden relative">
                 <div className="bg-[var(--bg-walnut)] h-8 flex items-center px-4 gap-2 border-b border-[var(--border-subtle)]">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                 </div>
                 <div className="p-6 font-mono text-sm h-[320px] overflow-y-auto">
                   <div className="mb-4 text-[var(--text-secondary)]">
                     $ initializing forge_agent... <span className="text-green-500">done</span>
                   </div>
                   <div className="mb-4">
                     <span className="text-[var(--accent-forge)]">➜</span> <span className="text-[var(--text-primary)]">scan --target solana --type grant</span>
                   </div>
                   <div className="mb-4 text-[var(--text-secondary)]">
                     <span className="text-blue-400">INFO</span> Scanning 14 sources...<br/>
                     <span className="text-blue-400">INFO</span> Found 3 new matches for profile 'Rust Developer':
                   </div>
                   <div className="space-y-3">
                     <div className="p-3 bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded flex justify-between items-center hover:border-[var(--accent-forge)] cursor-pointer">
                       <span>Solana Foundation Data Grant</span>
                       <span className="text-[var(--accent-forge)]">98% Match</span>
                     </div>
                     <div className="p-3 bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded flex justify-between items-center hover:border-[var(--accent-forge)] cursor-pointer">
                       <span>Superteam Radar Hackathon</span>
                       <span className="text-[var(--accent-amber)]">85% Match</span>
                     </div>
                     <div className="p-3 bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded flex justify-between items-center hover:border-[var(--accent-forge)] cursor-pointer">
                       <span>Anza Validator Program</span>
                       <span className="text-[var(--accent-cyan)]">New!</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-[var(--bg-walnut)] border-t border-[var(--border-subtle)]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to Forge Your Future?</h2>
          <Link href="/dashboard" className="btn btn-primary text-xl px-10 py-5">
            Get Started Now
          </Link>
          <div className="mt-8 text-[var(--text-secondary)] text-sm">
            No credit card required • Open Source • Built for Web3
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-[var(--border-subtle)] bg-[var(--bg-espresso)]">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <div>© 2026 OppForge. Open Source (MIT).</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[var(--text-primary)]">Twitter</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">GitHub</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
