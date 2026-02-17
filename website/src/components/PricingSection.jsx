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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card p-8 border-t-4 border-gray-500 relative flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Scout</h3>
              <div className="text-4xl font-bold mt-2 text-white">0 <span className="text-sm text-gray-500 font-normal uppercase font-mono">ETH</span></div>
              <p className="text-sm text-gray-500 mt-2 font-mono uppercase">Entry-level scouting.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-gray-500" /> Basic AI Analysis
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-gray-500" /> Public Feed Access
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-gray-500" /> 5 Tracking Slots
              </li>
            </ul>
            <Link href="/dashboard" className="btn btn-ghost w-full border border-[var(--border-subtle)] hover:bg-white/5 font-mono uppercase py-3">
              Initialize_Scout
            </Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="glass-card p-8 border-t-4 border-[var(--accent-forge)] relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,107,26,0.15)] bg-[#ff5500]/5">
            <div className="absolute top-0 right-0 bg-[var(--accent-forge)] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl font-mono">
              Most Alpha
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-forge)] uppercase tracking-widest">Legendary Hunter</h3>
              <div className="text-4xl font-bold mt-2 text-white">0.05 <span className="text-sm text-gray-500 font-normal uppercase font-mono">ETH</span></div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 font-mono uppercase">Decentralized Extraction.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Advanced AI Refining
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Private Signal Feed
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Unlimited Forge Access
              </li>
              <li className="flex gap-3 text-sm text-white font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-forge)]" /> Priority Proposals
              </li>
            </ul>
            <Link href="/dashboard/subscription" className="btn btn-primary w-full py-4 text-sm shadow-[0_0_20px_rgba(255,107,26,0.4)] font-mono uppercase">
              Upgrade_Protocol
            </Link>
          </div>

          {/* Lifetime Tier */}
          <div className="glass-card p-8 border-t-4 border-[var(--accent-gold)] relative flex flex-col bg-[#ffaa00]/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-gold)] uppercase tracking-widest">The Founder</h3>
              <div className="text-4xl font-bold mt-2 text-white">0.2 <span className="text-sm text-gray-500 font-normal uppercase font-mono">ETH</span></div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 font-mono uppercase">Lifetime Protocol Rights.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-gold)]" /> Lifetime Pro Access
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-gold)]" /> On-Chain Credentials
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-gold)]" /> Mission Funding Rights
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                <Check size={16} className="text-[var(--accent-gold)]" /> Governance Access
              </li>
            </ul>
            <Link href="/dashboard/subscription" className="btn btn-ghost w-full border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 font-mono uppercase py-3">
              Secure_Genesis_Pass
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
