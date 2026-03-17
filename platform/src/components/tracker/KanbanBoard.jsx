'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, MoreHorizontal, Zap, ArrowRight, XCircle, ChevronRight, FileText, ExternalLink, Trash2, Wand2, ChevronDown, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const COLUMNS = [
  { id: 'Interested', label: 'Saved', color: 'gray', description: 'Opportunities you\'re interested in' },
  { id: 'Drafting', label: 'In Progress', color: 'orange', description: 'Working on your application' },
  { id: 'Submitted', label: 'Applied', color: 'blue', description: 'Applications submitted' },
  { id: 'Results', label: 'Results', color: 'emerald', description: 'Won or lost outcomes' }
]

export default function KanbanBoard({ initialApplications, onRefresh, onOpenDrafter }) {
  const router = useRouter()
  const [apps, setApps] = useState(initialApplications)
  const [openMenuId, setOpenMenuId] = useState(null)

  const getColumnData = (columnId) => {
    if (columnId === 'Results') {
      return apps.filter(a => ['Won', 'Lost', 'Rejected'].includes(a.status))
    }
    return apps.filter(a => a.status === columnId)
  }

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/tracker/${appId}`, { status: newStatus })
      toast.success(`Moved to ${newStatus}`)
      setOpenMenuId(null)
      onRefresh()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const removeFromTracker = async (appId) => {
    try {
      await api.delete(`/tracker/${appId}`)
      toast.success("Removed from tracker")
      setOpenMenuId(null)
      onRefresh()
    } catch (err) {
      toast.error("Failed to remove")
    }
  }

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    const handle = () => setOpenMenuId(null)
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openMenuId])

  const getMoveOptions = (status) => {
    const all = [
      { label: 'Saved', value: 'Interested' },
      { label: 'In Progress', value: 'Drafting' },
      { label: 'Applied', value: 'Submitted' },
      { label: 'Won', value: 'Won' },
      { label: 'Lost', value: 'Lost' },
    ]
    return all.filter(o => o.value !== status && !(['Won','Lost','Rejected'].includes(status) && ['Won','Lost'].includes(o.value)))
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4 min-h-[400px] md:min-h-[600px]">
      {COLUMNS.map(col => {
        const columnApps = getColumnData(col.id)
        return (
          <div key={col.id} className="flex-1 md:min-w-[260px] flex flex-col gap-3">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  col.color === 'orange' ? 'bg-[#ff5500]' : 
                  col.color === 'blue' ? 'bg-blue-500' : 
                  col.color === 'emerald' ? 'bg-[#10b981]' : 'bg-gray-500'
                }`} />
                <h3 className="text-sm font-semibold text-gray-300">
                  {col.label}
                </h3>
              </div>
              <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                {columnApps.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 min-h-[200px] md:min-h-[500px]">
              <AnimatePresence>
                {columnApps.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    layoutId={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-card p-4 group hover:border-[#ff5500]/30 transition-all cursor-default ${app.is_expired ? 'opacity-60 border-red-500/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-gray-500">{app.type}</span>
                        {app.is_expired && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                            <AlertTriangle size={9} /> Expired
                          </span>
                        )}
                      </div>
                      {/* 3-dot menu */}
                      <div className="relative" onMouseDown={e => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          className={`transition-colors p-1 rounded-md ${openMenuId === app.id ? 'text-white bg-white/10' : 'text-gray-600 hover:text-white hover:bg-white/10'}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <AnimatePresence>
                          {openMenuId === app.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                            >
                              {/* View & Forge links */}
                              <button
                                onClick={() => { router.push(`/dashboard/opportunity/${app.opportunity_id}`); setOpenMenuId(null) }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <ExternalLink size={14} className="text-gray-500" /> View Opportunity
                              </button>
                              <button
                                onClick={() => { router.push(`/dashboard/forge/workspace/${app.opportunity_id}`); setOpenMenuId(null) }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-[#ff5500] transition-colors"
                              >
                                <Wand2 size={14} className="text-gray-500" /> Open in Forge
                              </button>

                              <div className="h-px bg-white/5 my-1" />

                              {/* Move to section */}
                              <div className="px-3.5 py-1.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Move to</span>
                              </div>
                              {getMoveOptions(app.status).map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => updateStatus(app.id, opt.value)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  <ChevronRight size={13} className="text-gray-600" /> {opt.label}
                                </button>
                              ))}

                              <div className="h-px bg-white/5 my-1" />

                              {/* Remove */}
                              <button
                                onClick={() => removeFromTracker(app.id)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={14} /> Remove from Tracker
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{app.title}</h4>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={13} /> {app.date}
                      </div>
                      
                      {/* Action Buttons — always visible, with labels */}
                      <div className="flex items-center gap-1.5">
                        {app.status === 'Interested' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'Drafting')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-[#ff5500]/20 rounded-lg transition-colors text-xs text-gray-400 hover:text-[#ff5500] font-medium"
                          >
                            <ArrowRight size={14} /> Start
                          </button>
                        )}
                        {app.status === 'Drafting' && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => onOpenDrafter(app)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#ff5500]/10 hover:bg-[#ff5500]/20 rounded-lg transition-colors text-xs text-[#ff5500] font-medium"
                            >
                              <Zap size={14} fill="currentColor" /> Draft
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, 'Submitted')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-blue-500/20 rounded-lg transition-colors text-xs text-gray-400 hover:text-blue-500 font-medium"
                            >
                              <CheckCircle size={14} /> Submit
                            </button>
                          </div>
                        )}
                        {app.status === 'Submitted' && (
                          <div className="flex gap-2 text-xs font-medium">
                             <button onClick={() => updateStatus(app.id, 'Won')} className="text-emerald-500 hover:underline px-2 py-1">Won</button>
                             <span className="text-gray-700 py-1">/</span>
                             <button onClick={() => updateStatus(app.id, 'Lost')} className="text-red-500 hover:underline px-2 py-1">Lost</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {columnApps.length === 0 && (
                <div className="h-full flex items-center justify-center p-8 text-center border-2 border-dashed border-white/5 rounded-lg min-h-[120px]">
                  <span className="text-sm text-gray-700">No items</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
