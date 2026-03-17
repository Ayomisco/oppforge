'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import { LayoutGrid, List, Zap, AlertTriangle } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import KanbanBoard from '@/components/tracker/KanbanBoard'
import AIDrafterModal from '@/components/tracker/AIDrafterModal'

const fetcher = url => api.get(url).then(res => res.data)

const StatusBadge = ({ status }) => {
  const styles = {
    'In Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Drafting': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Won': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Lost': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Interested': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'Applied': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[status] || styles['Interested']}`}>
      {status}
    </span>
  )
}

import FeatureGate from '@/components/ui/FeatureGate'
import { useRouter } from 'next/navigation'

export default function TrackerPage() {
  const router = useRouter()
  const { data: applications, error, mutate } = useSWR('/tracker', fetcher)
  const [view, setView] = useState('kanban')
  const [selectedMission, setSelectedMission] = useState(null)
  const [isDrafterOpen, setIsDrafterOpen] = useState(false)
  
  const openDrafter = (mission) => {
    router.push(`/dashboard/forge/workspace/${mission.opportunity_id || mission.id}`)
  }

  const PageContent = () => {
    if (!applications && !error) return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded" />
        <TableSkeleton />
      </div>
    )

    if (error) return (
      <div className="glass-card p-12 text-center border-red-500/10 bg-red-500/5 mt-8">
        <p className="text-red-400 text-base font-semibold">Failed to load tracker</p>
        <p className="text-gray-500 text-sm mt-2">Please check your connection and refresh.</p>
      </div>
    )

    const apps = applications || []

    return (
      <div className="space-y-6">
        {/* Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Application Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Track your applications from start to finish</p>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl self-start">
            <button 
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === 'kanban' ? 'bg-[#ff5500] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={16} /> Board
            </button>
            <button 
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === 'table' ? 'bg-[#ff5500] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                 <Zap size={32} className="text-gray-700" />
              </div>
              <div className="max-w-xs mx-auto">
                 <h3 className="text-white font-bold text-lg">No applications yet</h3>
                 <p className="text-sm text-gray-500 mt-1">Browse the feed to find opportunities and start tracking your applications.</p>
              </div>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard 
            initialApplications={apps} 
            onRefresh={mutate} 
            onOpenDrafter={openDrafter}
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-gray-400">Opportunity</th>
                  <th className="p-4 text-xs font-semibold text-gray-400">Type</th>
                  <th className="p-4 text-xs font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-400">Deadline</th>
                  <th className="p-4 text-xs font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${app.is_expired ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{app.title}</span>
                        {app.is_expired && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 shrink-0">
                            <AlertTriangle size={10} /> Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{app.category || app.type}</td>
                    <td className="p-4"><StatusBadge status={app.status} /></td>
                    <td className="p-4 text-xs font-mono text-gray-500">
                      {app.deadline ? new Date(app.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => openDrafter(app)}
                        className="text-[#ff5500] flex items-center gap-1.5 text-sm font-semibold hover:underline"
                      >
                        <Zap size={14} fill="currentColor" /> Open Draft
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    )
  }

  return (
    <FeatureGate featureName="Application Tracker">
      <PageContent />
    </FeatureGate>
  )
}
