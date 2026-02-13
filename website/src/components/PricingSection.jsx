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
              <div className="text-4xl font-bold mt-2 text-white">$0 <span className="text-sm text-gray-500 font-normal">/ month</span></div>
              <p className="text-sm text-gray-500 mt-2">For casual observers.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-gray-500" /> Public Opportunity Feed (24h delay)
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-gray-500" /> Basic Search
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-gray-500" /> 5 AI Chat queries / day
              </li>
            </ul>
            <Link href="/dashboard" className="btn btn-ghost w-full border border-[var(--border-subtle)] hover:bg-white/5">
              Start Scouting
            </Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="glass-card p-8 border-t-4 border-[var(--accent-forge)] relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,107,26,0.15)]">
            <div className="absolute top-0 right-0 bg-[var(--accent-forge)] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-forge)] uppercase tracking-widest">Hunter</h3>
              <div className="text-4xl font-bold mt-2 text-white">$29 <span className="text-sm text-gray-500 font-normal">/ month</span></div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">For serious builders.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-white">
                <Check size={18} className="text-[var(--accent-forge)]" /> <span className="font-bold">Real-Time</span> Alpha Feed
              </li>
              <li className="flex gap-3 text-sm text-white">
                <Check size={18} className="text-[var(--accent-forge)]" /> Unlimited AI Chat (GPT-4 Class)
              </li>
              <li className="flex gap-3 text-sm text-white">
                <Check size={18} className="text-[var(--accent-forge)]" /> Auto-Draft Proposals
              </li>
              <li className="flex gap-3 text-sm text-white">
                <Check size={18} className="text-[var(--accent-forge)]" /> Instant Email Alerts
              </li>
              <li className="flex gap-3 text-sm text-white">
                <Check size={18} className="text-[var(--accent-forge)]" /> Farming Strategy Guides
              </li>
            </ul>
            <button className="btn btn-primary w-full py-4 text-lg shadow-[0_0_20px_rgba(255,107,26,0.4)]">
              Upgrade Now
            </button>
          </div>

          {/* Lifetime Tier */}
          <div className="glass-card p-8 border-t-4 border-[var(--accent-gold)] relative flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--accent-gold)] uppercase tracking-widest">Founder</h3>
              <div className="text-4xl font-bold mt-2 text-white">$499 <span className="text-sm text-gray-500 font-normal">/ once</span></div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Lifetime Access NFT.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-[var(--accent-gold)]" /> Lifetime "Hunter" Access
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-[var(--accent-gold)]" /> Early Access to New Scrapers
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-[var(--accent-gold)]" /> Private Alpha Discord
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-secondary)]">
                <Check size={18} className="text-[var(--accent-gold)]" /> Tradable on Secondary Market
              </li>
            </ul>
            <button className="btn btn-ghost w-full border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10">
              Mint Genesis Pass
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
