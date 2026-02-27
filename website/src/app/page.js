'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Zap, Search, Menu, X, Rocket, Check } from 'lucide-react'
import PricingSection from '@/components/PricingSection'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--glass-border)] bg-transparent">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="OppForge Logo" className="w-8 h-8 rounded shrink-0 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-forge)] transition-colors">
            OppForge
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="#use-cases" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Use Cases</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="https://app.oppforge.xyz" className="btn btn-primary text-sm shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:shadow-[0_0_25px_rgba(255,85,0,0.6)]">
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
              <Link href="#use-cases" className="text-base font-medium text-[var(--text-secondary)]">Use Cases</Link>
              <Link href="#how-it-works" className="text-base font-medium text-[var(--text-secondary)]">How it Works</Link>
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center">Launch App</Link>
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
    <div className="min-h-screen flex flex-col pt-[var(--header-height)] bg-[var(--bg-espresso)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A1410] via-[#0D0A07] to-[#0D0A07] relative">
      
      {/* Fixed Galaxy Video Background for Entire Page */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-30 mix-blend-screen pointer-events-none filter sepia-[0.3] hue-rotate-[320deg]">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4" />
      </video>
      
      {/* Fixed Additional Galaxy Overlay */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }} 
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="fixed top-0 left-0 w-[110vw] h-[110vh] -translate-x-[5vw] -translate-y-[5vh] z-0 opacity-20 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      
      <div className="fixed inset-0 pointer-events-none scanlines z-10" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh] z-10 border-b border-[var(--glass-border)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--accent-forge)]/15 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="container relative z-10 text-center max-w-5xl mx-auto mt-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-walnut)]/80 border border-[var(--accent-forge)]/30 text-[var(--accent-forge)] text-xs lg:text-sm font-mono mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(255,85,0,0.2)]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-forge)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ffaa00]"></span>
              </span>
              OppForge AI Agent — v1.0 Public Beta is Live
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 tracking-tight drop-shadow-2xl">
              Forge Your Next <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-forge)] via-[#ffaa00] to-[var(--accent-gold)] filter drop-shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                Web3 Opportunity
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover <span className="text-white font-medium">Grants, Elite Hackathons, Bounties, Jobs, Testnets,</span> and <span className="text-white font-medium">Early Alphas</span>. The ultimate command center for <span className="text-[var(--accent-forge)] font-semibold">every Web3 individual</span>. Our autonomous AI monitors X (Twitter), direct ecosystems, and other trusted platforms 24/7—providing verifiable opportunities, scoring every drop, and drafting your winning proposals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full sm:w-auto text-xl px-10 py-5 group shadow-[0_0_30px_rgba(255,85,0,0.3)] hover:shadow-[0_0_50px_rgba(255,85,0,0.5)]">
                Launch Mission Control <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="#how-it-works" className="btn btn-ghost w-full sm:w-auto text-xl px-10 py-5 border border-[var(--glass-border)] hover:bg-[var(--glass-border)] backdrop-blur-md">
                View Architecture
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24 p-8 glass-card border-[var(--border-subtle)] bg-[var(--bg-espesso)]/50 backdrop-blur-xl">
              <Statistic value="50+" label="Supported Chains" />
              <Statistic value="0.4s" label="Scan Latency" />
              <Statistic value="$50M+" label="Tracked Value" />
              <Statistic value="98%" label="AI Match Accuracy" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative border-y border-[var(--glass-border)] overflow-hidden z-10">
        <div className="absolute inset-0 bg-[var(--bg-walnut)]/60 backdrop-blur-md -z-10" />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Intelligence & Verifiable Alpha</h2>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              Anyone can aggregate links. OppForge uses LangChain AI agents to strictly monitor trusted platforms, <span className="text-white">scoring verified opportunities out of 100</span> based on your skills, parsing submission requirements, and generating draft proposals that win.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <FeatureCard icon={Search} title="Autonomous Alpha Monitoring" description="AI agents continuously monitor official protocol blogs, X (Twitter), direct ecosystems, and trusted ecosystem forums. We surface verifiable, high-signal alpha the second it drops." delay={0.1} />
            <FeatureCard icon={Zap} title="Hyper-Personalized Scoring" description="Stop sifting through irrelevant noise. Your dashboard ranks opportunities precisely for your technical stack (Rust, Solidity, Python) and ecosystem." delay={0.2} />
            <FeatureCard icon={Terminal} title="Forge AI Chat Assistant" description="A context-aware chat interface. Ask 'Give me a step-by-step farming plan for this testnet' or 'Draft a 500-word grant proposal' and get it instantly." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Pricing Section - INJECTED HERE */}
      <PricingSection />

      {/* Target Audiences / Use Cases */}
      <section id="use-cases" className="py-24 relative z-10 border-t border-[var(--glass-border)] bg-[var(--bg-espresso)]/80">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Who Forges With Us?</h2>
            <p className="text-[var(--text-secondary)] text-lg">
              OppForge is designed to give you an unfair advantage, no matter what part of Web3 you operate in.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 border-t-2 border-[#10b981] hover:-translate-y-2 transition-transform">
              <h3 className="text-xl font-bold text-white mb-3">Bounty Hunters</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Stop checking 14 different tracking boards. Get pinged the second a bug bounty or developer task matches your tech stack (Rust, Solidity, etc.).
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-[var(--accent-forge)] hover:-translate-y-2 transition-transform">
              <h3 className="text-xl font-bold text-white mb-3">Hackathon Devs</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Discover under-the-radar global and local hackathons. Use our AI assistant to instantly structure winning architectures and submission formats.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-[#3b82f6] hover:-translate-y-2 transition-transform">
              <h3 className="text-xl font-bold text-white mb-3">Testnet Degens</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Never fall for a fake RPC or rug-pull node again. Our Risk Assessment AI verifies protocol authenticity before you ever sign a transaction.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-[var(--accent-gold)] hover:-translate-y-2 transition-transform">
              <h3 className="text-xl font-bold text-white mb-3">Ecosystem DAOs</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Monitor where builders are migrating to. Track volume of grants passing through other networks, and structure proposals to fund your own missions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Terminal Demo Preview */}
      <section id="how-it-works" className="py-24 border-t border-[var(--glass-border)] overflow-hidden bg-[#0A0705]">
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
      <section className="py-32 bg-[var(--bg-walnut)] border-t border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-forge)]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to Forge Your Future?</h2>
          <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
            Join the elite builders capturing the web3 opportunities everyone else is missing.
          </p>
          <Link href="https://app.oppforge.xyz" className="btn btn-primary text-2xl px-12 py-6 shadow-[0_0_40px_rgba(255,85,0,0.3)] hover:scale-105">
            Launch Platform
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
