'use client'

import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function AIAnalysisPanel({ id, score, probability, summary, strategy }) {
  return (
    <div className="glass-card p-5 sm:p-6 border border-[var(--border-glow)] shadow-[0_0_30px_rgba(255,107,26,0.08)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5500]/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 text-[#ff5500] font-semibold text-sm">
        <Sparkles size={16} /> AI Analysis
      </div>

      <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/5">
        <div>
          <div className="text-3xl font-bold text-white">{score}<span className="text-sm text-gray-500 ml-0.5">/100</span></div>
          <div className="text-xs text-gray-500 mt-0.5">Match Score</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#10b981]">{probability}</div>
          <div className="text-xs text-gray-500 mt-0.5">Win Rate</div>
        </div>
      </div>

      <div className="space-y-4">
        {summary && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Why apply</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{summary}</p>
          </div>
        )}

        {strategy && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Strategy</h4>
            <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-400 leading-relaxed">
              {strategy}
            </div>
          </div>
        )}

        <button 
          onClick={() => window.location.href = `/dashboard/forge/workspace/${id}`}
          className="w-full btn btn-primary mt-2 group justify-between text-sm"
        >
          <span>Draft with AI</span> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
