'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, MessageSquare, Zap, Hash, ArrowUpRight, ShieldCheck, Trash2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatMissionDeadline, getTrustStatus, truncate } from '@/lib/utils'
import { useAuth } from '../providers/AuthProvider'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// Score ring component
const ScoreRing = ({ score }) => {
  const color = score >= 90 ? '#ff5500' : score >= 70 ? '#ffaa00' : '#4b5563'
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
       <svg className="w-full h-full -rotate-90">
         <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
         <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round" />
       </svg>
       <span className="absolute text-[10px] font-bold text-white">{score}</span>
    </div>
  )
}

export default function OpportunityCard({ opp, index, onRefresh }) {
  const { user } = useAuth();
  
  if (!opp || !opp.id) {
    console.warn("OpportunityCard received invalid data:", opp);
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/opportunities/${opp.id}/verify`);
      toast.success('Mission Verified');
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to verify');
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Abort this mission permanently?')) return;
    try {
      await api.delete(`/opportunities/${opp.id}`);
      toast.success('Mission Purged');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card group flex items-start gap-4 p-3 hover:border-[#ff5500]/30 transition-all hover:bg-[var(--glass-shine)]"
    >
      {/* 1. Left: Score Indicator */}
      <div className="shrink-0 pt-1">
        <ScoreRing score={score} />
      </div>

      {/* 2. Middle: Info Density */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 rounded-sm border border-[#ffaa00]/20">
            {type}
          </span>
          <div 
            className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border"
            style={{ color: trust.color, borderColor: `${trust.color}22`, backgroundColor: trust.bg }}
          >
             <ShieldCheck size={10} /> {trust.label}
          </div>
          {opp.risk_level && (
            <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
              opp.risk_level.toUpperCase() === 'LOW' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
              opp.risk_level.toUpperCase() === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
              'text-red-500 bg-red-500/10 border-red-500/20'
            }`}>
               <ShieldCheck size={10} /> RISK: {opp.risk_level.toUpperCase()}
            </div>
          )}
          <span className="text-[10px] text-gray-700 font-mono">
             {opp.source}
          </span>
          {deadlineLabel !== "EXPIRED" && (
            <span className={`ml-auto flex items-center gap-1 text-[10px] font-bold ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
              <Clock size={10} /> {deadlineLabel}
            </span>
          )}
        </div>

        <Link href={`/dashboard/opportunity/${opp.id}`} className="group-hover:text-[#ff5500] transition-colors">
          <h3 className="text-sm font-bold text-white truncate pr-4">{opp.title}</h3>
        </Link>
        
        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
          {summary}
        </p>
      </div>

      {/* 3. Right: Reward & Action */}
      <div className="shrink-0 text-right flex flex-col items-end gap-2">
        <div className="text-sm font-bold text-[#10b981] font-mono">{opp.reward_pool || opp.reward || ''}</div>
        
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
          {user?.role === 'admin' && (
            <>
              {!opp.is_verified && (
                <button 
                  onClick={handleVerify}
                  className="p-1.5 hover:bg-green-500/10 rounded-sm text-gray-500 hover:text-green-500 transition-colors"
                  title="Verify Mission"
                >
                   <CheckCircle size={14} />
                </button>
              )}
              <button 
                onClick={handleDelete}
                className="p-1.5 hover:bg-red-500/10 rounded-sm text-gray-500 hover:text-red-500 transition-colors"
                title="Delete Mission"
              >
                 <Trash2 size={14} />
              </button>
            </>
          )}
          <Link 
            href={`/dashboard/opportunity/${opp.id}`}
            className="p-1.5 hover:bg-white/10 rounded-sm text-gray-500 hover:text-[#ffaa00] transition-colors"
          >
             <MessageSquare size={14} />
          </Link>
          <Link 
            href={`/dashboard/opportunity/${opp.id}`}
            className="p-1.5 bg-gradient-to-r from-[#ff5500] to-[#cc4400] text-white rounded-sm hover:scale-110 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
          >
             <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
