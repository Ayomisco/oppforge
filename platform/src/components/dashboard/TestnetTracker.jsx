import useSWR from 'swr'
import api from '@/lib/api'
import { Activity, ExternalLink } from 'lucide-react'
import React from 'react'

const fetcher = url => api.get(url).then(res => res.data)

export default function TestnetTracker() {
  const { data: testnets, error } = useSWR('/opportunities/testnets', fetcher)
  
  const loading = !testnets && !error

  return (
    <div className="glass-card p-5 mb-6 border-l-4 border-l-[#ff5500]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#ff5500] animate-pulse" />
          <h3 className="font-bold text-white text-sm">Live Testnets</h3>
        </div>
        <button className="text-[10px] text-gray-500 hover:text-white font-mono uppercase tracking-tighter">View All</button>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
             <div className="h-10 w-full bg-white/5 animate-pulse rounded" />
             <div className="h-10 w-full bg-white/5 animate-pulse rounded" />
             <div className="h-10 w-full bg-white/5 animate-pulse rounded" />
          </div>
        ) : (testnets || []).map((net) => (
          <div key={net.id} className="flex items-center justify-between p-2 rounded bg-[#0a0806] border border-[#1a1512] hover:border-[#ff5500]/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]"></div>
              <span className="text-[11px] font-bold text-gray-200">{net.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1a1512] text-gray-500 border border-white/5">
                {net.chain}
              </span>
              <ExternalLink size={12} className="text-gray-700 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
