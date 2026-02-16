'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Globe, Shield, Zap, ExternalLink } from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'

const fetcher = url => api.get(url).then(res => res.data)

export default function OpportunityDetail({ params }) {
  const { id } = use(params)
  
  // Guard Clause: Don't fetch if ID is invalid
  const shouldFetch = id && id !== 'undefined'
  const { data: opp, error, isLoading } = useSWR(shouldFetch ? `/opportunities/${id}` : null, fetcher)

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
    <div className="max-w-6xl mx-auto pb-20">
      {/* Back Nav */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-mono uppercase tracking-[0.2em]">Exit_Mission_Briefing</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content (Left, 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
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
            
            <h1 className="text-4xl font-black mb-4 leading-tight text-white tracking-tight">{opp.title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-500">
                <Globe size={14} className="text-[#ff5500]" /> {opp.source.toUpperCase()}
              </div>
              <div className={`flex items-center gap-2 ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                <Clock size={14} className="text-[#ff5500]" /> 
                <span>{isExpired ? 'MISSION_EXPIRED' : `CLOSING_IN: ${timeLimit.toUpperCase()}`}</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/20">
                <span className="text-[#10b981] font-black">$</span> 
                <span className="text-[#10b981]">{opp.reward_pool || 'UNSPECIFIED_YIELD'}</span>
              </div>
            </div>
          </div>

          {/* Mission Briefing */}
          <div className="glass-card p-8 border-l-4 border-l-[#ff5500] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-[#ff5500]/5 blur-[100px] rounded-full group-hover:bg-[#ff5500]/10 transition-colors" />
            <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-[#ff5500] mb-6 flex items-center gap-3">
              <Zap size={16} fill="currentColor" /> 01 // OVERVIEW
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line leading-relaxed text-base font-medium">
              {opp.description}
            </div>
          </div>

          {/* Requirements & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Operational Requirements */}
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                <Shield size={14} /> 02 // REQUIREMENTS
              </h3>
              <div className="space-y-4">
                {(opp.required_skills?.length > 0 ? opp.required_skills : ["Technical Proficiency", "Ecosystem Alignment", "Active Participation"]).map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#ff5500] shadow-[0_0_5px_#ff5500]" />
                    <span className="text-sm text-gray-400">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags & Tech Stack */}
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                <Zap size={14} /> 03 // INTELLIGENCE_TAGS
              </h3>
              <div className="flex flex-wrap gap-2">
                {(opp.tags?.length > 0 ? opp.tags : ["Web3", "Builder", "Early Signal"]).map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-mono text-gray-400 border border-white/10 hover:border-[#ffaa00]/50 hover:text-white transition-all cursor-crosshair">
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar (Right, 4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:ml-4">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel 
            score={opp.score}
            probability={opp.win_probability}
            summary={opp.summary}
            strategy={opp.strategy}
          />

          {/* Actions */}
          <div className="space-y-3">
            <a 
              href={opp.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary w-full justify-between items-center group py-4 px-6 text-sm"
            >
              DEPLOY_NOW <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <button className="btn btn-secondary w-full justify-center py-4 text-sm font-mono hover:bg-white/10">
              TRACK_MISSION
            </button>
          </div>

          {/* Intelligence Metadata */}
          <div className="glass-card p-6 border border-white/5 text-[10px] font-mono text-gray-500 space-y-4">
             <div className="pb-3 border-b border-white/5 flex justify-between items-center text-[8px] tracking-[0.2em] text-gray-600">
               <span>METADATA_EXTRACTED</span>
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-[#10b981]" />
                 <div className="w-1 h-1 bg-[#10b981]" />
                 <div className="w-1 h-1 bg-gray-800" />
               </div>
             </div>

            <div className="flex justify-between items-center">
              <span>SCAN_TIMESTAMP:</span>
              <span className="text-white">{formatDistanceToNow(new Date(opp.created_at || Date.now()))} AGO</span>
            </div>
            <div className="flex justify-between items-center">
              <span>SOURCE_PROTOCOL:</span>
              <span className="text-[#ff5500] font-bold">{opp.source.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
               <span>CHAIN_CONTEXT:</span>
               <span className="text-white">[{opp.chain.toUpperCase()}]</span>
            </div>
            <div className="flex justify-between items-center">
              <span>RELIABILITY:</span>
              <span className="text-[#10b981] font-bold">OPTIMAL_SCAN</span>
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-white/5">
              <span>UNIQUE_ID:</span>
              <span className="text-gray-700 truncate ml-4">#{id.slice(0, 18)}...</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
