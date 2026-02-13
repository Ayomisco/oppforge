'use client'

import React from 'react'
import { MoreHorizontal, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const APPLICATIONS = [
  { id: 1, title: 'Optimism RetroPGF Round 4', type: 'Grant', status: 'In Review', date: '2026-02-10', reward: 'Varies' },
  { id: 2, title: 'Solana Renaissance Hackathon', type: 'Hackathon', status: 'Draft', date: '2026-02-11', reward: '$1M Pool' },
  { id: 3, title: 'Aave Governance Grant', type: 'Grant', status: 'Won', date: '2026-01-15', reward: '$12,000' },
  { id: 4, title: 'Base Ecosystem Fund', type: 'Grant', status: 'Rejected', date: '2026-01-20', reward: '$50,000' },
]

const StatusBadge = ({ status }) => {
  const styles = {
    'In Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Draft': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Won': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wide border ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function TrackerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-walnut)]">
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)]">Opportunity</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)]">Type</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)]">Status</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)]">Date</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)]">Est. Reward</th>
              <th className="p-4 text-xs font-mono uppercase text-[var(--text-tertiary)] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {APPLICATIONS.map((app) => (
              <tr key={app.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-walnut)]/50 transition-colors">
                <td className="p-4 font-medium text-[var(--text-primary)]">{app.title}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)]">{app.type}</td>
                <td className="p-4"><StatusBadge status={app.status} /></td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{app.date}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{app.reward}</td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-[var(--bg-espresso)] rounded-full text-[var(--text-secondary)] transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {APPLICATIONS.length === 0 && (
           <div className="p-8 text-center text-[var(--text-tertiary)]">No tracked applications yet. start hunting!</div>
        )}
      </div>
    </div>
  )
}
