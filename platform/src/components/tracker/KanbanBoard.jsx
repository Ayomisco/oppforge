'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, MoreHorizontal, Zap, ArrowRight, XCircle, ChevronRight, FileText } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'Interested', label: 'Tactical Recon', color: 'gray' },
  { id: 'Drafting', label: 'Drafting Mission', color: 'orange' },
  { id: 'Submitted', label: 'Deployed', color: 'blue' },
  { id: 'Results', label: 'Extraction Results', color: 'emerald' }
]

export default function KanbanBoard({ initialApplications, onRefresh, onOpenDrafter }) {
  const [apps, setApps] = useState(initialApplications)

  const getColumnData = (columnId) => {
    if (columnId === 'Results') {
      return apps.filter(a => ['Won', 'Lost', 'Rejected'].includes(a.status))
    }
    return apps.filter(a => a.status === columnId)
  }

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/tracker/${appId}`, { status: newStatus })
      toast.success(`Mission moved to ${newStatus}`)
      onRefresh()
    } catch (err) {
      toast.error("Status shift failed.")
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4 custom-scrollbar min-h-[400px] md:min-h-[600px]">
      {COLUMNS.map(col => {
        const columnApps = getColumnData(col.id)
        return (
          <div key={col.id} className="flex-1 md:min-w-[260px] flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  col.color === 'orange' ? 'bg-[#ff5500]' : 
                  col.color === 'blue' ? 'bg-blue-500' : 
                  col.color === 'emerald' ? 'bg-[#10b981]' : 'bg-gray-500'
                }`} />
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
                  {col.label}
                </h3>
              </div>
              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                {columnApps.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-2 min-h-[500px]">
              <AnimatePresence>
                {columnApps.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    layoutId={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-4 group hover:border-[#ff5500]/30 transition-all cursor-default"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono text-gray-500 uppercase">{app.type}</span>
                      <button className="text-gray-600 hover:text-white transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">{app.title}</h4>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <Clock size={12} /> {app.date}
                      </div>
                      
                      {/* Action Triggers */}
                      <div className="flex items-center gap-1">
                        {app.status === 'Interested' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'Drafting')}
                            className="p-1.5 bg-white/5 hover:bg-[#ff5500]/20 rounded transition-colors text-gray-400 hover:text-[#ff5500]"
                            title="Move to Drafting"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                        {app.status === 'Drafting' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => onOpenDrafter(app)}
                              className="p-1.5 bg-[#ff5500]/10 hover:bg-[#ff5500]/20 rounded transition-colors text-[#ff5500]"
                              title="Forge AI Draft"
                            >
                              <Zap size={14} fill="currentColor" />
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, 'Submitted')}
                              className="p-1.5 bg-white/5 hover:bg-blue-500/20 rounded transition-colors text-gray-400 hover:text-blue-500"
                              title="Mark as Submitted"
                            >
                              <CheckCircle size={14} />
                            </button>
                          </div>
                        )}
                        {app.status === 'Submitted' && (
                          <div className="flex gap-1 text-[10px]">
                             <button onClick={() => updateStatus(app.id, 'Won')} className="text-emerald-500 hover:underline">WON</button>
                             <span className="text-gray-700">/</span>
                             <button onClick={() => updateStatus(app.id, 'Lost')} className="text-red-500 hover:underline">LOST</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {columnApps.length === 0 && (
                <div className="h-full flex items-center justify-center p-8 text-center border-2 border-dashed border-white/5 rounded-lg">
                  <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">No Missions</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
