'use client'

import React from 'react'
import { Activity, ExternalLink } from 'lucide-react'

// Mock Data for Testnets
const testnets = [
  { id: 1, name: 'Berachain Artio', status: 'High Yield', type: 'EVM' },
  { id: 2, name: 'Monad Devnet', status: 'Waitlist', type: 'L1' },
  { id: 3, name: 'Fuel Beta-4', status: 'Active', type: 'Modular' },
]

export default function TestnetTracker() {
  return (
    <div className="glass-card p-5 mb-6 border-l-4 border-l-[var(--accent-cyan)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[var(--accent-cyan)] animate-pulse" />
          <h3 className="font-bold text-[var(--text-primary)]">Live Testnets</h3>
        </div>
        <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono">View All</button>
      </div>
      
      <div className="space-y-3">
        {testnets.map((net) => (
          <div key={net.id} className="flex items-center justify-between p-2 rounded bg-[var(--bg-espresso)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--status-success)]"></div>
              <span className="text-sm font-medium">{net.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-walnut)] text-[var(--text-secondary)]">
                {net.type}
              </span>
              <ExternalLink size={12} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
