import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-walnut)]/20 skew-y-3 transform origin-bottom-left" />
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Invest in Your Alpha</h2>
          <p className="text-[var(--text-secondary)] text-lg">
            One grant win pays for a lifetime of OppForge. Choose your weapon.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card p-8 border-t-4 border-[#10b981] relative flex flex-col bg-[#10b981]/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#10b981] uppercase tracking-widest">Scout</h3>
              <div className="text-4xl font-bold mt-2 text-white">$0 <span className="text-sm text-gray-500 font-normal uppercase font-mono">/ 14 Days</span></div>
              <p className="text-sm text-gray-400 mt-2 font-mono uppercase">Full Access Alpha Trial.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[#10b981]" /> Full AI Analysis & Scoring
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[#10b981]" /> Priority Alpha Feed
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[#10b981]" /> 5 AI Proposal Generations
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[#10b981]" /> Mission Tracking (5 slots)
              </li>
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-ghost w-full border border-[var(--border-subtle)] hover:bg-[#10b981]/10 text-[#10b981] font-mono uppercase py-3 transition-colors">
              Initialize_Trial
            </Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="glass-card p-8 border-t-4 border-[var(--accent-forge)] relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,107,26,0.15)] bg-[#ff5500]/5">
            <div className="absolute top-0 right-0 bg-[var(--accent-forge)] text-white shadow-[0_0_15px_rgba(255,85,0,0.5)] text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl font-mono">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-forge)] uppercase tracking-widest">Hunter</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-white">$2.9</span>
                <span className="text-sm text-gray-400 font-normal font-mono">/ month</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase">Pay via Crypto (~0.0012 ETH)</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Everything in Scout
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Unlimited AI Proposal Generation
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Unlimited Forge AI Chat
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Sub-5s Real-Time Alerts
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Priority Support
              </li>
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full py-4 text-sm shadow-[0_0_20px_rgba(255,107,26,0.4)] font-mono uppercase transition-all hover:scale-105">
              Secure_Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
