'use client'

import React from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import { MoreHorizontal, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const styles = {
    'In Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Draft': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Won': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
    // Default fallback
    'Interested': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'Applied': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wide border ${styles[status] || styles['Interested']}`}>
      {status}
    </span>
  )
}

const fetcher = url => api.get(url).then(res => res.data)

export default function TrackerPage() {
  const { data: applications, error } = useSWR('/tracker', fetcher)
  
  if (!applications) return <div className="p-8 text-center text-gray-500">Loading Tracker...</div>

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
            {applications.map((app) => (
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
        
        {applications.length === 0 && (
           <div className="p-8 text-center text-[var(--text-tertiary)]">No tracked applications yet. Start hunting!</div>
        )}
      </div>
    </div>
  )
}
