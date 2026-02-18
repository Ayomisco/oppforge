'use client'

import React from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import { FolderKanban, ExternalLink, Calendar, Shield } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/Skeleton'

const fetcher = url => api.get(url).then(res => res.data)

export default function ApplicationsPage() {
  const { data: applications, error } = useSWR('/tracker', fetcher)

  if (!applications && !error) return <TableSkeleton />
  if (error) return <div className="text-red-500 font-mono text-xs">ERR_PROTOCOL_SYNC_FAILED</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20">
          <FolderKanban size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Mission Ledger</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Archive of all on-chain and off-chain engagements</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-4 text-[10px] font-mono uppercase text-gray-500">Mission Identity</th>
              <th className="p-4 text-[10px] font-mono uppercase text-gray-500">Network</th>
              <th className="p-4 text-[10px] font-mono uppercase text-gray-500">Engagement Status</th>
              <th className="p-4 text-[10px] font-mono uppercase text-gray-500">Timestamp</th>
              <th className="p-4 text-[10px] font-mono uppercase text-gray-500">Links</th>
            </tr>
          </thead>
          <tbody>
            {applications?.length === 0 ? (
                <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                        Zero engagement records found.
                    </td>
                </tr>
            ) : (
                applications?.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-bold text-white">{app.title}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-mono">{app.category}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono text-[#ffaa00] border border-[#ffaa00]/20 bg-[#ffaa00]/5 px-2 py-0.5 rounded">
                            {app.chain}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Won' ? 'bg-green-500' : 'bg-[#ff5500]'}`} />
                           <span className="text-xs font-mono uppercase text-gray-300">{app.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                          <Calendar size={12} />
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                         <a href={app.url} target="_blank" className="p-2 hover:text-[#ff5500] transition-colors inline-block">
                            <ExternalLink size={14} />
                         </a>
                      </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
