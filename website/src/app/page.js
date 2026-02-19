'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Zap, Search, Menu, X, Rocket, Check, Sparkles, ShieldCheck, Globe, Cpu, Layers, Lock, BarChart3, Users, Network } from 'lucide-react'
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
          <Link href="#intel-layer" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Intelligence Layer</Link>
          <Link href="#risk-engine" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Risk Engine</Link>
          <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="https://app.oppforge.xyz" className="btn btn-primary text-sm px-6">
            Enter The Protocol <ArrowRight size={16} />
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
              <Link href="#intel-layer" className="text-base font-medium text-[var(--text-secondary)]">Intelligence Layer</Link>
              <Link href="#risk-engine" className="text-base font-medium text-[var(--text-secondary)]">Risk Engine</Link>
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center">Launch App</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const FeatureCard = ({ icon: Icon, title, description, badge, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }} className="glass-card p-8 flex flex-col gap-4 group hover:bg-[var(--bg-walnut)] transition-all border-white/5 hover:border-[var(--accent-forge)]/30">
    <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-[var(--bg-mahogany)] flex items-center justify-center text-[var(--accent-forge)] group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        {badge && (
            <span className="text-[9px] font-mono bg-[var(--accent-forge)]/10 text-[var(--accent-forge)] px-2 py-1 rounded border border-[var(--accent-forge)]/20 uppercase tracking-widest">{badge}</span>
        )}
    </div>
    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">{title}</h3>
    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{description}</p>
  </motion.div>
)

const EcosystemBadge = ({ name }) => (
  <div className="px-6 py-3 border border-white/5 bg-white/5 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-[var(--accent-forge)]/10 hover:border-[var(--accent-forge)]/30 transition-all cursor-default flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-forge)]" />
    {name}
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[var(--header-height)] bg-[var(--bg-espresso)]">
      <div className="scanlines" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--bg-walnut)_0%,_transparent_70%)] opacity-50" />
        
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--accent-amber)] text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-10">
              <Network size={12} />
              The Intelligence Layer for Web3 Alpha
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black leading-[0.8] tracking-tighter mb-8 italic">
              OWN THE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-forge)] via-[var(--accent-gold)] to-white">
                INFRASTRUCTURE.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              OppForge is the intelligence brain between Web3 ecosystems and builders. We don't just aggregate; we <span className="text-white border-b border-[var(--accent-forge)]/50">Detect, Verify, and Assess Risk</span> for every opportunity in the space.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full sm:w-auto text-lg px-12 py-5 shadow-[0_0_40px_rgba(255,85,0,0.3)] transition-all uppercase tracking-widest font-black italic">
                Initialize Protocol <Rocket size={20} className="ml-2" />
              </Link>
              <Link href="#intel-layer" className="btn btn-ghost w-full sm:w-auto text-lg px-12 py-5 border border-white/10 hover:bg-white/5 uppercase tracking-widest font-bold">
                Read Whitepaper
              </Link>
            </div>

            <div className="mt-20 pt-20 border-t border-white/5">
                <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--text-tertiary)] mb-8">Integrated Intelligence Streaming From</p>
                <div className="flex flex-wrap justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
                    {['DoraHacks', 'Devpost', 'Gitcoin', 'Gitcoin', 'Dework', 'Immunefi', 'Code4rena', 'ETHGlobal', 'Sherlock', 'Layer3'].map((name) => (
                        <EcosystemBadge key={name} name={name} />
                    ))}
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Intelligence Layer Section */}
      <section id="intel-layer" className="py-32 bg-[var(--bg-espresso)] relative">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
                <div className="absolute inset-0 bg-[var(--accent-forge)]/20 blur-[100px] -z-10" />
                <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tight italic">DECISION<br/>INTELLIGENCE.</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed">
                    Most builders fail because of analysis paralysis. OppForge processes 1,000+ data signals per hour to give you the signal you need to win.
                </p>
                <div className="space-y-6">
                    {[
                        { title: "Layer 1: Deterministic Filtering", desc: "URL normalization and canonicalization to prevent duplication." },
                        { title: "Layer 2: Content Similarity", desc: "Cosine similarity thresholds to cluster identical ecosystem announcements." },
                        { title: "Layer 3: Semantic Logic", desc: "Merging multi-source announcements into a single structured mission object." }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 glass-card border-white/5 bg-white/5">
                            <span className="text-[var(--accent-forge)] font-mono text-xl font-bold">0{i+1}</span>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-wide text-sm mb-1">{step.title}</h4>
                                <p className="text-xs text-[var(--text-secondary)]">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="glass-card p-1 border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-[var(--accent-forge)]/5">
                <div className="aspect-video bg-[var(--bg-walnut)] relative flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="relative text-center p-8">
                        <Terminal size={48} className="mx-auto mb-6 text-[var(--accent-forge)] animate-pulse" />
                        <p className="text-[var(--text-secondary)] font-mono text-sm">
                            $ forge_intelligence --monitor --all-ecosystems<br/>
                            <span className="text-green-500">[SCANNING]</span> Gitcoin Passport (New Mission Detected)<br/>
                            <span className="text-blue-500">[AUDIT]</span> Verified Source: Immunefi (Critical Priority)<br/>
                            <span className="text-yellow-500">[DEDUPLICATING]</span> Cluster found in devpost + github<br/>
                            <span className="text-[var(--accent-forge)] font-bold">STATUS: ALIGNMENT ACHIEVED</span>
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Engine Section */}
      <section id="risk-engine" className="py-32 bg-[var(--bg-walnut)]/20 border-y border-white/5">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic">THE SHIELD PROTOCOL.</h2>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
               In Web3, risk is the default. OppForge provides the sovereign defense layer for builders, assessing legitimacy before you even click apply.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={ShieldCheck} title="Scam Probability" description="ML-driven pattern matching to detect fraudulent grants and phishing mission sites." badge="Security" delay={0.1} />
            <FeatureCard icon={Lock} title="Rug Risk Assessment" description="Analyzing liquidity depth and team transparency for ecosystem-specific rewards." badge="Risk" delay={0.2} />
            <FeatureCard icon={Users} title="Team Legitimacy" description="Identifying anonymous or suspicious founding teams before protocol engagement." badge="Audit" delay={0.3} />
            <FeatureCard icon={BarChart3} title="Prize Normalization" description="Evaluating prize pools for unrealistic multipliers that signal bad-faith announcements." badge="Verify" delay={0.4} />
          </div>
        </div>
      </section>

      {/* User Segments / Roles */}
      <section className="py-32 relative">
        <div className="container">
           <div className="grid md:grid-cols-3 gap-12">
               {[
                   { role: "For Founders", desc: "Scale your ecosystem by letting the world's best hunters find your grants. We verify talent so you don't have to.", icon: Cpu },
                   { role: "For Builders", desc: "Stop hunting. Start building. Get a personalized feed of missions ranked by your ROI and win probability.", icon: Zap },
                   { role: "For Investors", desc: "Early detection of emerging protocols. Track where the builders are moving before the VCs do.", icon: BarChart3 }
               ].map((item, i) => (
                   <div key={i} className="text-center p-10 group cursor-default">
                       <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-[var(--accent-forge)] group-hover:bg-[var(--accent-forge)] group-hover:text-white group-hover:-rotate-12 transition-all">
                           <item.icon size={32} />
                       </div>
                       <h3 className="text-2xl font-black mb-4 italic tracking-tight">{item.role}</h3>
                       <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{item.desc}</p>
                   </div>
               ))}
           </div>
        </div>
      </section>

      {/* Pricing Injected */}
      <PricingSection />

      {/* CTA Footer */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-espresso)] via-[var(--bg-walnut)] to-transparent" />
        <div className="container relative z-10 text-center">
            <div className="w-24 h-24 rounded-3xl bg-[var(--accent-forge)] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,85,0,0.5)] rotate-3">
                <Sparkles size={48} className="text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">FORGE YOUR<br/>EDGE TODAY.</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                <Link href="https://app.oppforge.xyz" className="btn btn-primary text-xl px-12 py-5 shadow-2xl">
                    Launch Mainnet Alpha
                </Link>
                <Link href="#" className="btn btn-ghost border border-white/10 text-xl px-12 py-5">
                    Contact Sales
                </Link>
            </div>
            <div className="mt-12 text-[var(--text-tertiary)] font-mono text-[10px] uppercase tracking-[0.5em]">
                System Status: Operational // 4,281 Missions Processed // $148M Secured
            </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-[var(--bg-espresso)]">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="OppForge" className="w-6 h-6 grayscale opacity-50" />
            <div>© 2026 OppForge. The Opportunity Intelligence Protocol.</div>
          </div>
          <div className="flex gap-8 font-mono uppercase tracking-widest">
            <Link href="#" className="hover:text-[var(--accent-forge)] transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-[var(--accent-forge)] transition-colors">API Access</Link>
            <Link href="#" className="hover:text-[var(--accent-forge)] transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
