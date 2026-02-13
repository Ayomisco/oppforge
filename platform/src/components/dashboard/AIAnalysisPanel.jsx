'use client'

import React from 'react'
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export default function AIAnalysisPanel({ score, probability, summary, strategy }) {
  return (
    <div className="glass-card p-6 border border-[var(--border-glow)] shadow-[0_0_30px_rgba(255,107,26,0.1)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-20 bg-[var(--accent-forge)]/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 text-[var(--accent-forge)] font-bold uppercase tracking-wider text-sm">
        <Sparkles size={16} /> Forge AI Analysis
      </div>

      <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="text-3xl font-bold font-mono text-[var(--text-primary)]">{score}<span className="text-sm text-[var(--text-tertiary)]">/100</span></div>
          <div className="text-xs text-[var(--text-secondary)]">Match Score</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-mono text-[var(--status-success)] text-green-400">{probability}</div>
          <div className="text-xs text-[var(--text-secondary)]">Win Probability</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Why you should apply:</h4>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {summary}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Recommended Strategy:</h4>
          <div className="p-3 bg-[var(--bg-walnut)] rounded border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] font-mono">
            {strategy}
          </div>
        </div>

        {/* Action */}
        <button className="w-full btn btn-primary mt-4 group justify-between">
          <span>Ask Forge to Draft Proposal</span> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
