import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-[var(--accent-gold)] text-xs font-medium uppercase tracking-widest mb-4">
            ★ Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight font-[family-name:var(--font-heading)]">Invest in Your Alpha</h2>
          <p className="text-[var(--text-secondary)] text-lg">
            One grant win can cover months of OppForge. Choose your weapon.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card p-8 flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--status-success)] to-[var(--status-success)]/30 rounded-t-2xl" />
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[var(--status-success)] uppercase tracking-widest font-[family-name:var(--font-heading)]">Scout</h3>
              <div className="text-5xl font-bold mt-3 text-[var(--text-primary)] font-[family-name:var(--font-heading)]">$0 <span className="text-base text-[var(--text-tertiary)] font-normal">/ 7 Days</span></div>
              <p className="text-sm text-[var(--text-tertiary)] mt-2">Full access alpha trial. No card needed.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Full AI Analysis & Scoring', 'Priority Alpha Feed', '5 AI Proposal Generations', 'Mission Tracking (5 slots)'].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                  <Check size={16} className="text-[var(--status-success)] shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-secondary w-full justify-center py-3.5 border-[var(--status-success)]/20 text-[var(--status-success)] hover:bg-[var(--status-success)]/10 hover:border-[var(--status-success)]/30">
              Start Free Trial
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="glass-card p-8 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-scarlet)] to-[var(--accent-gold)] rounded-t-2xl" />
            <div className="absolute top-3 right-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-scarlet)] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[var(--accent-primary)] uppercase tracking-widest font-[family-name:var(--font-heading)]">Hunter</h3>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-5xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-heading)]">$10</span>
                <span className="text-base text-[var(--text-tertiary)]">/ month</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] mt-2">Pay via crypto (~0.005 ETH on Arbitrum)</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Scout', 'Unlimited AI Proposals', 'Unlimited Forge AI Chat', 'Sub-5s Real-Time Alerts', 'Priority Support'].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[var(--text-primary)]">
                  <Check size={16} className="text-[var(--accent-primary)] shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <Link href="https://app.oppforge.xyz" className="btn btn-primary w-full justify-center py-4">
              Get Hunter Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
