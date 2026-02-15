'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Globe, Shield, Zap, ExternalLink } from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'

const fetcher = url => api.get(url).then(res => res.data)

export default function OpportunityDetail({ params }) {
  const { id } = params
  const { data: opp, error, isLoading } = useSWR(`/opportunities/${id}`, fetcher)

  if (isLoading) return (
    <div className="max-w-5xl mx-auto pb-20 animate-pulse">
      <div className="h-4 w-24 bg-white/5 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 w-3/4 bg-white/5 rounded" />
          <div className="h-40 bg-white/5 rounded" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
        <div className="h-64 bg-white/5 rounded" />
      </div>
    </div>
  )

  if (error || !opp) return (
    <div className="max-w-5xl mx-auto py-20 text-center">
      <p className="text-gray-500 mb-4">Opportunity not found or mission aborted.</p>
      <Link href="/dashboard" className="btn btn-secondary">Return to Mission Control</Link>
    </div>
  )

  const isExpired = opp.deadline && new Date(opp.deadline) < new Date()
  const timeLimit = opp.deadline ? formatDistanceToNow(new Date(opp.deadline), { addSuffix: true }) : 'No deadline'

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back Nav */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left, 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 rounded bg-[#ff5500]/10 border border-[#ff5500]/20 text-[10px] font-mono uppercase tracking-wide text-[#ffaa00]">
                {opp.category}
              </span>
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wide text-gray-400">
                {opp.chain}
              </span>
              {opp.is_verified && (
                <span className="flex items-center gap-1 text-[10px] text-[#10b981] font-bold">
                  <Shield size={10} /> VERIFIED
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">{opp.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Globe size={14} /> {opp.source}
              </div>
              <div className={`flex items-center gap-2 ${isExpired ? 'text-red-400' : 'text-orange-400'}`}>
                <Clock size={14} /> {isExpired ? 'Expired' : `Deadline: ${timeLimit}`}
              </div>
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-[#10b981]">$</span> {opp.reward_pool || 'Unspecified Value'}
              </div>
            </div>
          </div>

          {/* Mission Briefing */}
          <div className="glass-card p-6 border-l-2 border-l-[#ff5500]">
            <h3 className="text-sm font-mono uppercase tracking-widest text-[#ff5500] mb-4 flex items-center gap-2">
              <Zap size={14} /> Mission_Briefing
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line leading-relaxed">
              {opp.description}
            </div>
          </div>

          {/* Operational Requirements */}
          {opp.required_skills?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Shield size={14} /> Operational_Requirements
              </h3>
              <div className="flex flex-wrap gap-2">
                {opp.required_skills.map((req, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel 
            score={opp.ai_score}
            probability={opp.win_probability}
            summary={opp.ai_summary || "Our agents are currently scanning deeper for strategic advantages..."}
            strategy={opp.strategy || "Analyze the official documentation for specific submission requirements while our AI generates a targeted approach."}
          />

          {/* Actions */}
          <div className="space-y-3">
            <a 
              href={opp.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary w-full justify-between group py-3"
            >
              Apply to Mission <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="btn btn-secondary w-full justify-center">
              Add to Tracker
            </button>
          </div>

          {/* Intelligence Metadata */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-500 space-y-3">
            <div className="flex justify-between items-center">
              <span>INTEL_AGE:</span>
              <span className="text-white">{formatDistanceToNow(new Date(opp.created_at))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>SCAN_SOURCE:</span>
              <span className="text-[#ff5500]">{opp.source.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>CONFIDENCE_LEVEL:</span>
              <span className="text-[#10b981]">HIGH_FIDELITY</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
