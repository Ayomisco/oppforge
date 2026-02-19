'use client'

import Link from 'next/link'
import { Check, Shield, Zap, Sparkles, Cpu } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-[var(--bg-espresso)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--accent-forge)_0%,_transparent_50%)] opacity-5" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter">PROTOCOL TIERS.</h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-light font-mono uppercase tracking-wide">
            One grant win scales your career. Choose your clearance level.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Scout Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 border border-white/5 flex flex-col hover:border-white/10 transition-all group"
          >
            <div className="mb-10">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold text-white/50 uppercase tracking-[0.3em] font-mono">Scout</h3>
              <div className="text-5xl font-black mt-4 text-white italic">FREE <span className="text-sm text-white/20 font-normal uppercase font-mono tracking-widest not-italic">Forever</span></div>
              <p className="text-[10px] text-white/30 mt-4 font-mono uppercase tracking-widest leading-relaxed">Basic alpha detection for early-stage builders.</p>
            </div>
            <ul className="space-y-6 mb-12 flex-1">
              {[
                  "Standard Alpha Feed (24h Delay)",
                  "Basic AI Scoring",
                  "Public Mission Access",
                  "5 Simultaneous Trackers"
              ].map((item, i) => (
                <li key={i} className="flex gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 leading-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-ghost w-full border border-white/10 hover:bg-white/5 font-mono uppercase tracking-widest py-4 italic font-bold">
              Initialize_Scout
            </Link>
          </motion.div>

          {/* Hunter Tier (Premium/Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-10 border-2 border-[var(--accent-forge)] relative flex flex-col shadow-[0_0_80px_rgba(255,85,0,0.15)] overflow-hidden group"
          >
            <div className="absolute top-0 right-0 bg-[var(--accent-forge)] text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-[0.3em] font-mono italic">
              Elite Access
            </div>
            <div className="mb-10">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-forge)]/10 flex items-center justify-center mb-6 text-[var(--accent-forge)] group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--accent-forge)] uppercase tracking-[0.3em] font-mono">Legendary Hunter</h3>
              <div className="text-5xl font-black mt-4 text-white italic">0.05 <span className="text-sm text-white/40 font-normal uppercase font-mono tracking-widest not-italic">ETH/mo</span></div>
              <p className="text-[10px] text-[var(--accent-forge)]/80 mt-4 font-mono uppercase tracking-widest leading-relaxed">Full intelligence streaming & tactical UI.</p>
            </div>
            <ul className="space-y-6 mb-12 flex-1">
              {[
                  "Real-time Alpha (Sub-5s Delay)",
                  "Advanced Risk Intelligence Shield",
                  "Unlimited Forge AI Context",
                  "AI-Generated Grant Proposals",
                  "Deduplication Protocol Enabled"
              ].map((item, i) => (
                <li key={i} className="flex gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white shadow-sm leading-tight">
                   <Zap size={10} className="text-[var(--accent-forge)] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full py-5 text-sm font-black italic uppercase tracking-widest shadow-[0_0_40px_rgba(255,85,0,0.5)]">
              Upgrade_Protocol
            </Link>
          </motion.div>

          {/* Founder Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 border border-[var(--accent-gold)]/30 flex flex-col group"
          >
            <div className="mb-10">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center mb-6 text-[var(--accent-gold)] group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--accent-gold)] uppercase tracking-[0.3em] font-mono">The Founder</h3>
              <div className="text-5xl font-black mt-4 text-white italic">0.2 <span className="text-sm text-white/20 font-normal uppercase font-mono tracking-widest not-italic">ETH LFT</span></div>
              <p className="text-[10px] text-[var(--accent-gold)]/80 mt-4 font-mono uppercase tracking-widest leading-relaxed">One-time payment. Lifetime sovereignty.</p>
            </div>
            <ul className="space-y-6 mb-12 flex-1">
              {[
                  "Lifetime Legendary Hunter Access",
                  "Priority Beta Scraper Integration",
                  "Governance Rights In The Forge",
                  "Exclusive Ecosystem Alpha Calls",
                  "Verifiable Genesis Credential"
              ].map((item, i) => (
                <li key={i} className="flex gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/70 leading-tight">
                  <Check size={14} className="text-[var(--accent-gold)] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-ghost w-full border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 font-mono uppercase tracking-widest py-4 italic font-bold">
              Secure_Genesis_Pass
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
