'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight, ShieldCheck, Trash2, CheckCircle, Calendar, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import { formatMissionDeadline, getTrustStatus, truncate } from '@/lib/utils'
import { getOppImage } from '@/lib/chainLogos'
import { useAuth } from '../providers/AuthProvider'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const ScoreRing = ({ score }) => {
  const radius = 14
  const circumference = 2 * Math.PI * radius
  if (!score || score === 0) {
    return (
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-default)]" />
        </svg>
        <span className="absolute text-[9px] font-bold text-[var(--text-tertiary)]">New</span>
      </div>
    )
  }
  const color = score >= 90 ? 'var(--accent-primary)' : score >= 70 ? 'var(--accent-secondary)' : score >= 40 ? 'var(--status-info)' : 'var(--text-tertiary)'
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-default)]" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[10px] font-bold text-[var(--text-primary)] tabular-nums">{score}</span>
    </div>
  )
}

export default function OpportunityCard({ opp, index, onRefresh }) {
  const { user, isGuest } = useAuth()
  const [isSaved, setIsSaved] = useState(false)

  if (!opp || !opp.id) return null

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (isGuest) return
    try {
      await api.post('/tracker', { opportunity_id: opp.id, status: 'Interested' })
      setIsSaved(true); toast.success('Saved to tracker')
    } catch (err) {
      if (err?.response?.status === 400) { setIsSaved(true); toast.success('Already saved') }
      else toast.error('Failed to save')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault(); e.stopPropagation()
    try { await api.patch(`/opportunities/${opp.id}/verify`); toast.success('Verified'); if (onRefresh) onRefresh() }
    catch { toast.error('Failed to verify') }
  }

  const handleDelete = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this opportunity permanently?')) return
    try { await api.delete(`/opportunities/${opp.id}`); toast.success('Deleted'); if (onRefresh) onRefresh() }
    catch { toast.error('Failed to delete') }
  }

  const score = opp.score || opp.ai_score || 0
  const type = opp.type || opp.category || 'Unknown'
  const summary = opp.summary || opp.ai_summary || opp.description || ''
  const trust = getTrustStatus(opp.trust_score || (opp.is_verified ? 95 : 60))
  const deadlineLabel = formatMissionDeadline(opp.deadline)
  const isUrgent = deadlineLabel.includes('day') || deadlineLabel.includes('hour')
  const reward = opp.reward_pool || opp.reward || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg group p-4 hover:border-[var(--accent-primary)]/25 transition-all"
    >
      <Link href={`/dashboard/opportunity/${opp.id}`} className="block">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-[var(--accent-secondary)] bg-[var(--accent-secondary-muted)] px-2 py-0.5 rounded-md border border-[var(--accent-secondary)]/20">
            {type}
          </span>
          <div
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
            style={{ color: trust.color, borderColor: `${trust.color}22`, backgroundColor: trust.bg }}
          >
            <ShieldCheck size={12} /> {trust.label}
          </div>
          {opp.risk_level && (
            <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              opp.risk_level.toUpperCase() === 'LOW' ? 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20' :
              opp.risk_level.toUpperCase() === 'MEDIUM' ? 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20' :
              'text-[var(--status-danger)] bg-[var(--status-danger)]/10 border-[var(--status-danger)]/20'
            }`}>
              Risk: {opp.risk_level}
            </div>
          )}
          {opp.source && (
            <span className="text-[11px] text-[var(--text-tertiary)] ml-auto hidden sm:block">{opp.source}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0 hidden sm:flex flex-col items-center gap-1.5">
            {(() => {
              const logoUrl = getOppImage(opp)
              return logoUrl ? (
                <img src={logoUrl} alt={opp.chain || opp.source || ''} className="w-8 h-8 rounded-md object-contain bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-1" onError={(e) => { e.target.style.display = 'none' }} />
              ) : null
            })()}
            <ScoreRing score={score} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 leading-snug">
              {opp.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1.5 leading-relaxed">{summary}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {reward && (
                <span className="flex items-center gap-1 text-sm font-bold text-[var(--status-success)]">
                  <DollarSign size={14} /> {reward}
                </span>
              )}
              {deadlineLabel !== "EXPIRED" && (
                <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-[var(--status-danger)]' : 'text-[var(--text-tertiary)]'}`}>
                  <Calendar size={13} /> {deadlineLabel}
                </span>
              )}
              {opp.source && (
                <span className="text-xs text-[var(--text-tertiary)] sm:hidden">{opp.source}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {user?.role === 'admin' && (
              <div className="flex items-center gap-1">
                {!opp.is_verified && (
                  <button onClick={handleVerify} className="p-1.5 hover:bg-[var(--status-success)]/10 rounded-md text-[var(--text-tertiary)] hover:text-[var(--status-success)] transition-colors" title="Verify">
                    <CheckCircle size={16} />
                  </button>
                )}
                <button onClick={handleDelete} className="p-1.5 hover:bg-[var(--status-danger)]/10 rounded-md text-[var(--text-tertiary)] hover:text-[var(--status-danger)] transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            {!isGuest && (
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-[var(--status-success)] bg-[var(--status-success)]/10' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-secondary)]'}`}
                title={isSaved ? 'Saved' : 'Save to Tracker'}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            )}
            <div className="p-2 bg-[var(--accent-primary)] text-white rounded-md hover:bg-[var(--accent-primary-hover)] transition-all shadow-sm">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
