'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight, ShieldCheck, Trash2, CheckCircle, Calendar, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import { formatMissionDeadline, getTrustStatus, truncate } from '@/lib/utils'
import { useAuth } from '../providers/AuthProvider'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// Score ring component
const ScoreRing = ({ score }) => {
  const circumference = 2 * Math.PI * 16

  if (!score || score === 0) {
    return (
      <div className="relative w-11 h-11 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
        </svg>
        <span className="absolute text-[9px] font-semibold text-gray-500">New</span>
      </div>
    )
  }

  const color = score >= 90 ? '#ff5500' : score >= 70 ? '#ffaa00' : score >= 40 ? '#3b82f6' : '#4b5563'
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
       <svg className="w-full h-full -rotate-90">
         <circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
         <circle cx="22" cy="22" r="16" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
       </svg>
       <span className="absolute text-[11px] font-bold text-white">{score}</span>
    </div>
  )
}

export default function OpportunityCard({ opp, index, onRefresh }) {
  const { user, isGuest } = useAuth();
  const [isSaved, setIsSaved] = useState(false)
  
  if (!opp || !opp.id) {
    console.warn("OpportunityCard received invalid data:", opp);
    return null;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) return;
    try {
      await api.post('/tracker', { opportunity_id: opp.id, status: 'Interested' })
      setIsSaved(true)
      toast.success('Saved to tracker')
    } catch (err) {
      if (err?.response?.status === 400) {
        setIsSaved(true)
        toast.success('Already saved')
      } else {
        toast.error('Failed to save')
      }
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/opportunities/${opp.id}/verify`);
      toast.success('Opportunity verified');
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to verify');
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this opportunity permanently?')) return;
    try {
      await api.delete(`/opportunities/${opp.id}`);
      toast.success('Opportunity deleted');
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card group p-4 sm:p-5 hover:border-[#ff5500]/30 transition-all"
    >
      <Link href={`/dashboard/opportunity/${opp.id}`} className="block">
        {/* Top Row: Type + Trust + Deadline */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-[#ffaa00] bg-[#ffaa00]/10 px-2 py-1 rounded-md border border-[#ffaa00]/20">
            {type}
          </span>
          <div 
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border"
            style={{ color: trust.color, borderColor: `${trust.color}22`, backgroundColor: trust.bg }}
          >
             <ShieldCheck size={12} /> {trust.label}
          </div>
          {opp.risk_level && (
            <div className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${
              opp.risk_level.toUpperCase() === 'LOW' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
              opp.risk_level.toUpperCase() === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
              'text-red-500 bg-red-500/10 border-red-500/20'
            }`}>
               Risk: {opp.risk_level}
            </div>
          )}
          {opp.source && (
            <span className="text-[11px] text-gray-600 ml-auto hidden sm:block">
               {opp.source}
            </span>
          )}
        </div>

        {/* Main Content Row */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Score Ring */}
          <div className="shrink-0 hidden sm:block">
            <ScoreRing score={score} />
          </div>

          {/* Title + Summary */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-[#ff5500] transition-colors line-clamp-2 leading-snug">
              {opp.title}
            </h3>
            
            <p className="text-sm text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
              {summary}
            </p>

            {/* Meta Row: Reward + Deadline + Source (mobile) */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {reward && (
                <span className="flex items-center gap-1 text-sm font-bold text-[#10b981]">
                  <DollarSign size={14} /> {reward}
                </span>
              )}
              {deadlineLabel !== "EXPIRED" && (
                <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-400' : 'text-gray-500'}`}>
                  <Calendar size={13} /> {deadlineLabel}
                </span>
              )}
              {opp.source && (
                <span className="text-xs text-gray-600 sm:hidden">
                   {opp.source}
                </span>
              )}
            </div>
          </div>

          {/* Actions — always visible */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {user?.role === 'admin' && (
              <div className="flex items-center gap-1">
                {!opp.is_verified && (
                  <button 
                    onClick={handleVerify}
                    className="p-2 hover:bg-green-500/10 rounded-lg text-gray-500 hover:text-green-500 transition-colors"
                    title="Verify"
                  >
                     <CheckCircle size={16} />
                  </button>
                )}
                <button 
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                   <Trash2 size={16} />
                </button>
              </div>
            )}
            {!isGuest && (
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved ? 'text-[#10b981] bg-[#10b981]/10' : 'text-gray-500 hover:bg-white/5 hover:text-[#ffaa00]'
                }`}
                title={isSaved ? 'Saved' : 'Save to Tracker'}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            )}
            <div
              className="p-2.5 bg-gradient-to-r from-[#ff5500] to-[#cc4400] text-white rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
            >
               <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
