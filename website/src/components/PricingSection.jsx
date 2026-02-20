'use client'

import Link from 'next/link'
import { Check, Shield, Zap, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-[var(--bg-espresso)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--accent-forge)_0%,_transparent_50%)] opacity-5" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter">SIMPLE PRICING.</h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Start free. Upgrade when you're ready. Built for builders, not enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Scout Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 border border-white/5 flex flex-col hover:border-[#10b981]/20 transition-all group"
          >
            <div className="mb-8">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} className="text-[#10b981]" />
              </div>
              <h3 className="text-xl font-bold text-white">Scout</h3>
              <div className="text-5xl font-black mt-4 text-white">$0 <span className="text-sm text-gray-500 font-normal">/ 14 days</span></div>
              <p className="text-sm text-gray-500 mt-3">Full access for 2 weeks. No card required.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                  "Full AI Analysis & Scoring",
                  "Priority Alpha Feed",
                  "5 AI Proposal Generations",
                  "Risk Intelligence Shield",
                  "5 Mission Tracking Slots"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-400">
                  <Check size={16} className="text-[#10b981] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-ghost w-full border border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/10 py-4 font-bold text-sm transition-all">
              Start Free Trial
            </Link>
          </motion.div>

          {/* Hunter Tier (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-10 border-2 border-[var(--accent-forge)] relative flex flex-col shadow-[0_0_60px_rgba(255,85,0,0.12)] overflow-hidden group"
          >
            <div className="absolute top-0 right-0 bg-[var(--accent-forge)] text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider">
              Best Value
            </div>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-forge)]/10 flex items-center justify-center mb-6 text-[var(--accent-forge)] group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--accent-forge)]">Hunter</h3>
              <div className="text-5xl font-black mt-4 text-white">$2.9 <span className="text-sm text-gray-500 font-normal">/month</span></div>
              <p className="text-sm text-[var(--accent-forge)]/70 mt-3">Unlimited AI for serious builders.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                  "Everything in Scout",
                  "Unlimited Proposal Generations",
                  "Sub-5s Real-time Alpha Feed",
                  "Advanced Deduplication Protocol",
                  "Unlimited Mission Tracking",
                  "Forge AI Chat (Unlimited)",
                  "Priority Support"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/80">
                   <Zap size={14} className="text-[var(--accent-forge)] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full py-5 text-sm font-bold shadow-[0_0_30px_rgba(255,85,0,0.4)]">
              Get Hunter — $2.9/mo
            </Link>
          </motion.div>

          {/* Founder Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 border border-[var(--accent-gold)]/30 flex flex-col group hover:border-[var(--accent-gold)]/50 transition-all"
          >
            <div className="mb-8">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center mb-6 text-[var(--accent-gold)] group-hover:scale-110 transition-transform">
                <Crown size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--accent-gold)]">Founder</h3>
              <div className="text-5xl font-black mt-4 text-white">$6 <span className="text-sm text-gray-500 font-normal">/month</span></div>
              <p className="text-sm text-[var(--accent-gold)]/70 mt-3">Maximum intelligence for teams.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                  "Everything in Hunter",
                  "Team Collaboration (3 seats)",
                  "Custom Scraper Integration",
                  "API Access (Coming Soon)",
                  "On-Chain Reputation Badge",
                  "Exclusive Alpha Calls",
                  "White-Glove Onboarding"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-400">
                  <Check size={14} className="text-[var(--accent-gold)] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-ghost w-full border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 py-4 font-bold text-sm transition-all">
              Get Founder — $6/mo
            </Link>
          </motion.div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-6">Pay with crypto (ETH). Cancel anytime. 14-day money-back guarantee.</p>
          <div className="flex items-center justify-center gap-8 text-gray-700 text-xs font-mono">
            <span>SECURED_ON_CHAIN</span>
            <span>·</span>
            <span>NO_LOCK_IN</span>
            <span>·</span>
            <span>CANCEL_ANYTIME</span>
          </div>
        </div>
      </div>
    </section>
  )
}
