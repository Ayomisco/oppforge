'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Trash2, CheckCircle, Calendar, DollarSign, Bookmark, BookmarkCheck, Trophy, Gift, Rocket, Coins, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { formatMissionDeadline } from '@/lib/utils'
import { getOppImage, getChainLogo } from '@/lib/chainLogos'
import { useAuth } from '../providers/AuthProvider'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// Category color mapping
const CATEGORY_STYLES = {
  hackathon: { color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.3)', icon: Trophy },
  grant: { color: '#58a6ff', bg: 'rgba(88,166,255,0.12)', border: 'rgba(88,166,255,0.3)', icon: Gift },
  bounty: { color: '#ff5500', bg: 'rgba(255,85,0,0.12)', border: 'rgba(255,85,0,0.3)', icon: Coins },
  testnet: { color: '#a371f7', bg: 'rgba(163,113,247,0.12)', border: 'rgba(163,113,247,0.3)', icon: Rocket },
  airdrop: { color: '#56d4dd', bg: 'rgba(86,212,221,0.12)', border: 'rgba(86,212,221,0.3)', icon: Zap },
  quest: { color: '#ffaa00', bg: 'rgba(255,170,0,0.12)', border: 'rgba(255,170,0,0.3)', icon: Star },
  ambassador: { color: '#e879f9', bg: 'rgba(232,121,249,0.12)', border: 'rgba(232,121,249,0.3)', icon: Star },
  accelerator: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', icon: Rocket },
}

function getCategoryStyle(type) {
  const key = (type || '').toLowerCase()
  return CATEGORY_STYLES[key] || { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.25)', icon: Star }
}

// Score color — always colorful
function getScoreColor(score) {
  if (score >= 75) return '#3fb950'
  if (score >= 50) return '#58a6ff'
  if (score >= 30) return '#ffaa00'
  if (score >= 15) return '#ff5500'
  return '#f85149'
}

// Compact AI Score badge — separate from logo
const ScoreBadge = ({ score }) => {
  const displayScore = score && score > 0 ? score : null
  const color = displayScore ? getScoreColor(score) : 'var(--text-tertiary)'

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
      style={{ background: displayScore ? `${color}15` : 'var(--bg-tertiary)', border: `1px solid ${displayScore ? `${color}30` : 'var(--border-default)'}` }}
      title={displayScore ? `AI Score: ${score}/100` : 'Not scored yet'}
    >
      <Zap size={10} style={{ color }} />
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
        {displayScore || '—'}
      </span>
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
  const deadlineLabel = formatMissionDeadline(opp.deadline)
  const isUrgent = deadlineLabel.includes('day') || deadlineLabel.includes('hour')
  const reward = opp.reward_pool || opp.reward || ''
  const logoUrl = getOppImage(opp)
  const chainLogoUrl = getChainLogo(opp?.chain)
  const catStyle = getCategoryStyle(type)
  const CategoryIcon = catStyle.icon
  const isNew = opp.created_at && (Date.now() - new Date(opp.created_at).getTime()) < 48 * 60 * 60 * 1000

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl group hover:border-[var(--accent-primary)]/20 transition-all"
    >
      <Link href={`/dashboard/opportunity/${opp.id}`} className="block p-4">
        <div className="flex items-start gap-3">
          {/* Left: Logo with chain badge */}
          <div className="shrink-0 relative">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}` }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }} />
              ) : null}
              <span className={`${logoUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                <CategoryIcon size={20} style={{ color: catStyle.color }} />
              </span>
            </div>
            {/* Chain logo badge — bottom-right corner */}
            {chainLogoUrl && chainLogoUrl !== logoUrl && (
              <img
                src={chainLogoUrl}
                alt={opp.chain || ''}
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-primary)] border border-[var(--border-default)] object-contain p-[1px]"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </div>

          {/* Center: Content */}
          <div className="flex-1 min-w-0">
            {/* Title row with category + score */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0" style={{ color: catStyle.color }}>{type}</span>
              {opp.chain && <span className="text-[10px] text-[var(--text-tertiary)]">{opp.chain}</span>}
              {isNew && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,85,0,0.15)', color: '#ff5500', border: '1px solid rgba(255,85,0,0.3)' }}>
                  NEW
                </span>
              )}
              <div className="ml-auto"><ScoreBadge score={score} /></div>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 leading-snug">
              {opp.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-1 leading-relaxed">{summary}</p>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2.5">
              {reward && (
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--status-success)]">
                  <DollarSign size={12} />{reward}
                </span>
              )}
              {deadlineLabel !== "EXPIRED" && (
                <span className={`flex items-center gap-1 text-[11px] font-medium ${isUrgent ? 'text-[var(--status-danger)]' : 'text-[var(--text-tertiary)]'}`}>
                  <Calendar size={11} />{deadlineLabel}
                </span>
              )}
              {opp.source && (
                <span className="text-[11px] text-[var(--text-tertiary)] ml-auto hidden sm:inline">{opp.source}</span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="shrink-0 flex items-center gap-1.5 ml-1">
            {user?.role === 'admin' && (
              <>
                {!opp.is_verified && (
                  <button onClick={handleVerify} className="p-1.5 hover:bg-[var(--status-success)]/10 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--status-success)] transition-colors" title="Verify">
                    <CheckCircle size={15} />
                  </button>
                )}
                <button onClick={handleDelete} className="p-1.5 hover:bg-[var(--status-danger)]/10 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--status-danger)] transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </>
            )}
            {!isGuest && (
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]'}`}
                title={isSaved ? 'Saved' : 'Save'}
              >
                {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
            )}
            <div className="p-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-lg group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
              <ArrowUpRight size={15} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
