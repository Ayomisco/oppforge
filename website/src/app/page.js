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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded flex items-center justify-center">
            <img src="/logo.png" alt="OppForge" className="w-full h-full object-contain mix-blend-screen" />
          </div>
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

const AlphaPill = ({ title, subtitle, domain }) => (
  <div className="flex items-center gap-3 bg-[var(--bg-espresso)] border border-[var(--glass-border)] 
                rounded-xl px-4 py-2.5 shadow-lg hover:bg-[var(--bg-mahogany)] hover:scale-105 transition-all cursor-default group">
    <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center overflow-hidden p-[2px]">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={title} className="w-full h-full object-contain" />
    </div>
    <div className="text-left">
      <div className="text-white text-xs font-bold font-sans tracking-tight leading-tight">{title}</div>
      <div className="text-[var(--text-secondary)] text-[10px] font-mono uppercase">{subtitle}</div>
    </div>
  </div>
)

const MetricSymbol = () => (
   <span className="text-[var(--accent-forge)] opacity-80 animate-pulse text-lg">✥</span>
)

const SourcePill = ({ name, domain }) => (
  <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--bg-espresso)]/50 
                  hover:bg-[var(--bg-mahogany)] hover:border-[#ff5500]/50 text-[var(--text-primary)] hover:text-white transition-all font-medium">
    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm p-[2px]">
       <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={name} className="w-full h-full object-contain" />
    </div>
    {name}
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[var(--header-height)] bg-[var(--bg-void)] relative overflow-hidden">
      {/* Dynamic Background Noise & Gradients */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#ff5500]/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffaa00]/5 rounded-full blur-[150px] pointer-events-none z-0" />
      
      <Navbar />

        {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden border-b border-[var(--glass-border)] pt-24 pb-32">
        <div className="container relative z-10 flex flex-col items-center justify-center">

          {/* Main Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-[800px] mx-auto z-30"
          >
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-6 text-[#fff] tracking-tight text-balance">
              Opportunities that don't exist on the timeline yet.
            </h1>
            <p className="font-sans text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              We track fresh protocol grants, governance bounties, airdrops, testnets, and VC portfolios. You get curated alpha with 10 competitors, not 1,000.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
               <AlphaPill title="Ethereum Foundation" subtitle="Data Grant" domain="ethereum.org" />
               <AlphaPill title="Arbitrum DAO" subtitle="$50k Bounty" domain="arbitrum.foundation" />
               <AlphaPill title="Aave Protocol" subtitle="Risk Analysis" domain="aave.com" />
               <AlphaPill title="Superteam" subtitle="Validator Track" domain="superteam.fun" />
            </div>

            <Link href="/dashboard" className="inline-flex items-center justify-center bg-[var(--bg-espresso)] hover:bg-[#ff5500] 
                                              border border-[#ff5500]/50 hover:border-[#ff5500] text-white text-lg font-bold px-10 py-5 
                                              rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,85,0,0.15)] hover:shadow-[0_0_40px_rgba(255,85,0,0.4)]
                                              font-sans group">
              Launch Mission Control <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <div className="mt-8 text-sm font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
              Available now - Starting at $0/mo
            </div>
          </motion.div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[var(--bg-void)]/80 backdrop-blur-md border-t border-[var(--glass-border)] py-4 overflow-hidden z-20">
          <div className="container flex flex-wrap items-center justify-center gap-6 md:gap-12 lg:gap-16 text-sm md:text-base font-sans font-medium text-[var(--text-secondary)]">
            <div className="flex items-center gap-2"><span className="text-white text-lg font-heading italic">&lt;5</span> competitors per listing</div>
            <MetricSymbol />
            <div className="flex items-center gap-2"><span className="text-white text-lg font-heading italic">2k+</span> sources monitored</div>
            <MetricSymbol />
            <div className="flex items-center gap-2"><span className="text-white text-lg font-heading italic">94%</span> semantic match accuracy</div>
            <MetricSymbol />
            <div className="flex items-center gap-2"><span className="text-white text-lg font-heading italic">24/7</span> autonomous scanning</div>
          </div>
        </div>
      </section>

      {/* Where We Look Section */}
      <section className="py-24 md:py-32 relative z-10 bg-[var(--bg-void)]">
        <div className="container max-w-5xl">
          <div className="mb-16">
             <div className="text-[#ff5500] text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4">Where we look</div>
             <h2 className="font-heading text-4xl md:text-6xl text-white leading-[1.1] mb-6 tracking-tight max-w-2xl">
               We monitor everything.<br/>So you don't have to.
             </h2>
             <p className="font-sans text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
               Every block, every day, our AI agents scan GitHub repos, commonwealth governance boards, VC portfolio updates, discord announcements, and hackathon platforms to find the bounties that just launched and are about to start hiring.
             </p>
          </div>

          <div className="space-y-16">
             {/* Category 1 */}
             <div>
                <div className="text-[var(--text-tertiary)] text-xs font-mono uppercase tracking-widest border-b border-[var(--glass-border)] pb-2 mb-6">
                  Developer & Builder Platforms
                </div>
                <div className="flex flex-wrap gap-4">
                  <SourcePill name="Gitcoin" domain="gitcoin.co" />
                  <SourcePill name="Devpost" domain="devpost.com" />
                  <SourcePill name="DoraHacks" domain="dorahacks.io" />
                  <SourcePill name="Buidlbox" domain="buidlbox.io" />
                  <SourcePill name="Superteam Earn" domain="superteam.fun" />
                  <SourcePill name="GitHub Issues" domain="github.com" />
                </div>
             </div>

             {/* Category 2 */}
             <div>
                <div className="text-[var(--text-tertiary)] text-xs font-mono uppercase tracking-widest border-b border-[var(--glass-border)] pb-2 mb-6">
                  Venture Capital Portfolios
                </div>
                <div className="flex flex-wrap gap-4">
                  <SourcePill name="a16z crypto" domain="a16zcrypto.com" />
                  <SourcePill name="Paradigm" domain="paradigm.xyz" />
                  <SourcePill name="Sequoia Capital" domain="sequoiacap.com" />
                  <SourcePill name="Hack VC" domain="hack.vc" />
                  <SourcePill name="Variant Fund" domain="variant.fund" />
                  <SourcePill name="Electric Capital" domain="electriccapital.com" />
                  <SourcePill name="Framework Ventures" domain="framework.ventures" />
                </div>
             </div>

             {/* Category 3 */}
             <div>
                <div className="text-[var(--text-tertiary)] text-xs font-mono uppercase tracking-widest border-b border-[var(--glass-border)] pb-2 mb-6">
                  Governance & Ecosystems
                </div>
                <div className="flex flex-wrap gap-4">
                  <SourcePill name="Commonwealth" domain="commonwealth.im" />
                  <SourcePill name="Snapshot" domain="snapshot.org" />
                  <SourcePill name="X (Twitter)" domain="twitter.com" />
                  <SourcePill name="Farcaster" domain="farcaster.xyz" />
                  <SourcePill name="Discord Announcements" domain="discord.com" />
                  <SourcePill name="Messari" domain="messari.io" />
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
