'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Activity, Terminal, Lock, ChevronRight, X, Info, FileJson } from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

const fetcher = url => api.get(url).then(res => res.data)

export default function AuditPage() {
  const { data: logs, mutate } = useSWR('/admin/audit', fetcher)
  const [selectedLog, setSelectedLog] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openDetails = (log) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Shield className="text-[#ff5500]" /> Intelligence Audit Logs
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-tight">System forensic activity & security events</p>
        </div>
        <button 
          onClick={() => mutate()}
          className="px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-sm text-[10px] font-mono text-[#10b981] flex items-center gap-2 hover:bg-[#10b981]/20 transition-colors"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            REFRESH_STREAM
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
            { label: 'Security Events', value: logs?.filter(l => l.type === 'security').length || 0, icon: Lock, color: '#ff5500' },
            { label: 'Data Changes', value: logs?.filter(l => l.type === 'data').length || 0, icon: Activity, color: '#ffaa00' },
            { label: 'System Pulsar', value: 'Active', icon: Terminal, color: '#10b981' },
            { label: 'Logs Recorded', value: logs?.length || 0, icon: Shield, color: '#3b82f6' },
        ].map((stat, i) => (
            <div key={i} className="glass-card p-4 border border-white/5 flex items-center gap-4">
                <div className="p-2 rounded bg-white/5" style={{ color: stat.color }}>
                    <stat.icon size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase">{stat.label}</div>
                    <div className="text-lg font-bold text-white tracking-widest leading-none mt-1">{stat.value}</div>
                </div>
            </div>
        ))}
      </div>

      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
            <div className="flex gap-12">
                <span className="w-32">Action</span>
                <span>Detail</span>
            </div>
            <span>Timestamp</span>
        </div>
        <div className="divide-y divide-white/5">
          {logs?.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={log.id} 
              onClick={() => openDetails(log)}
              className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-12">
                <div className="w-32">
                    <div className="text-[11px] font-bold text-[#ffaa00] font-mono uppercase truncate">{log.action}</div>
                    <div className="text-[9px] text-gray-600 font-mono mt-0.5">TYPE: {log.type.toUpperCase()}</div>
                </div>
                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                   <ChevronRight size={12} className="text-[#ff5500] opacity-30" />
                   {log.details}
                </div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true }).toUpperCase()}
              </div>
            </motion.div>
          ))}
          {(!logs || logs.length === 0) && (
            <div className="p-20 text-center text-gray-500 font-mono text-xs">NO AUDIT DATA RECORDED YET.</div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedLog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0d0a08] border border-[#ff5500]/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(255,85,0,0.1)]"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#ff5500]/5">
                <div className="flex items-center gap-3">
                  <Info size={16} className="text-[#ff5500]" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Forensic Detail: {selectedLog.id.slice(0,8)}</span>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 font-mono mb-2">Detailed Briefing</h4>
                  <p className="text-sm text-white font-medium leading-relaxed">{selectedLog.details}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 font-mono mb-1">Target ID</h4>
                    <p className="text-xs text-gray-300 font-mono">{selectedLog.target_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 font-mono mb-1">Timestamp</h4>
                    <p className="text-xs text-gray-300 font-mono">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedLog.payload && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 font-mono mb-2 flex items-center gap-2">
                       <FileJson size={12} /> Data Payload
                    </h4>
                    <pre className="p-4 bg-black border border-white/5 rounded text-[10px] text-[#ffaa00] overflow-x-auto font-mono max-h-40 overflow-y-auto">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold uppercase text-white transition-colors"
                >
                  Close_Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 p-4 border border-white/5 rounded text-[10px] font-mono text-gray-500 flex justify-between uppercase">
        <span>LOG_BUFFER_STATUS: 100%_CLEAN</span>
        <span>ENCRYPTION: AES-256-GCM</span>
      </div>
    </div>
  )
}
