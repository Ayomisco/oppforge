import useSWR from 'swr'
import api from '@/lib/api'
import { Activity, ExternalLink } from 'lucide-react'
import React from 'react'

const fetcher = url => api.get(url).then(res => res.data)

export default function TestnetTracker() {
  const { data: testnets, error } = useSWR('/opportunities/testnets', fetcher)
  const loading = !testnets && !error

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 border-l-[3px] border-l-[var(--accent-primary)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[var(--accent-primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">Live Testnets</h3>
        </div>
        <button className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-medium uppercase tracking-wider">View All</button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 w-full bg-[var(--bg-tertiary)] animate-pulse rounded-md" />
            <div className="h-10 w-full bg-[var(--bg-tertiary)] animate-pulse rounded-md" />
          </div>
        ) : (testnets || []).map((net) => (
          <div key={net.id} className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-muted)] hover:border-[var(--accent-primary)]/30 transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] shadow-[0_0_4px_var(--status-success)]" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">{net.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                {net.chain}
              </span>
              <ExternalLink size={12} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
