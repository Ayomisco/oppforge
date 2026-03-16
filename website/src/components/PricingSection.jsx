import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-[var(--border-default)] bg-[var(--bg-canvas)] relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Invest in Your Alpha</h2>
          <p className="text-[var(--text-secondary)] text-lg">
            One grant win can cover months of OppForge. Choose your weapon.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-8 border-t-4 border-t-[var(--status-success)] relative flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--status-success)] uppercase tracking-widest">Scout</h3>
              <div className="text-4xl font-bold mt-2 text-[var(--text-primary)]">$0 <span className="text-sm text-[var(--text-tertiary)] font-normal uppercase font-mono">/ 7 Days</span></div>
              <p className="text-sm text-[var(--text-tertiary)] mt-2 font-mono uppercase">Full Access Alpha Trial.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Full AI Analysis & Scoring', 'Priority Alpha Feed', '5 AI Proposal Generations', 'Mission Tracking (5 slots)'].map(item => (
                <li key={item} className="flex gap-3 text-[10px] text-[var(--text-secondary)] font-mono uppercase">
                  <Check size={16} className="text-[var(--status-success)] shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-secondary w-full justify-center py-3 font-mono uppercase border-[var(--status-success)]/30 text-[var(--status-success)] hover:bg-[var(--status-success)]/10">
              Initialize_Trial
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-8 border-t-4 border-t-[var(--accent-primary)] relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,85,0,0.12)]">
            <div className="absolute top-0 right-0 bg-[var(--accent-primary)] text-white shadow-[0_0_15px_rgba(255,85,0,0.5)] text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl font-mono">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-primary)] uppercase tracking-widest">Hunter</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-[var(--text-primary)]">$10</span>
                <span className="text-sm text-[var(--text-tertiary)] font-normal font-mono">/ month</span>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-mono uppercase">Pay via Crypto (~0.005 ETH on Arbitrum)</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Scout', 'Unlimited AI Proposal Generation', 'Unlimited Forge AI Chat', 'Sub-5s Real-Time Alerts', 'Priority Support'].map(item => (
                <li key={item} className="flex gap-3 text-[10px] text-[var(--text-primary)] font-mono uppercase">
                  <Check size={16} className="text-[var(--accent-primary)] shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center py-4 text-sm shadow-[0_0_20px_rgba(255,85,0,0.3)] font-mono uppercase hover:scale-[1.02] transition-transform">
              Secure_Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
