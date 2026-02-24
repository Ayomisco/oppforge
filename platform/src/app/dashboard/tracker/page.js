'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import { LayoutGrid, List, Zap } from 'lucide-react'
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
    <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wide border ${styles[status] || styles['Interested']}`}>
      {status}
    </span>
  )
}

import { useRouter } from 'next/navigation'

export default function TrackerPage() {
  const router = useRouter()
  const { data: applications, error, mutate } = useSWR('/tracker', fetcher)
  const [view, setView] = useState('kanban') // 'table' or 'kanban'
  const [selectedMission, setSelectedMission] = useState(null)
  const [isDrafterOpen, setIsDrafterOpen] = useState(false)
  
  if (!applications && !error) return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-white/5 animate-pulse rounded" />
      <TableSkeleton />
    </div>
  )

  if (error) return (
    <div className="glass-card p-12 text-center border-red-500/10 bg-red-500/5 mt-8">
      <p className="text-red-500 font-mono text-sm tracking-widest uppercase">Sync Error</p>
      <p className="text-gray-500 text-xs mt-2">Failed to load mission tracker. Please refresh your forge.</p>
    </div>
  )

  const apps = applications || []

  const openDrafter = (mission) => {
    router.push(`/dashboard/forge/workspace/${mission.opportunity_id || mission.id}`)
  }

  return (
    <div className="space-y-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Execute, track, and extract your rewards</p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl self-start">
          <button 
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-[#ff5500] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <LayoutGrid size={14} /> Campaign
          </button>
          <button 
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'table' ? 'bg-[#ff5500] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <List size={14} /> Ledger
          </button>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
               <Zap size={32} className="text-gray-700" />
            </div>
            <div className="max-w-xs mx-auto">
               <h3 className="text-white font-bold">No Missions Active</h3>
               <p className="text-sm text-gray-500">Scan the feed to find high-probability opportunities and begin your forge.</p>
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
                <th className="p-4 text-xs font-mono uppercase text-gray-500">Mission</th>
                <th className="p-4 text-xs font-mono uppercase text-gray-500">Type</th>
                <th className="p-4 text-xs font-mono uppercase text-gray-500">Status</th>
                <th className="p-4 text-xs font-mono uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 text-sm font-bold text-white">{app.title}</td>
                  <td className="p-4 text-xs text-gray-500 font-mono uppercase">{app.category || app.type}</td>
                  <td className="p-4"><StatusBadge status={app.status} /></td>
                  <td className="p-4">
                    <button 
                      onClick={() => openDrafter(app)}
                      className="text-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Zap size={12} fill="currentColor" /> Forge Draft
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
