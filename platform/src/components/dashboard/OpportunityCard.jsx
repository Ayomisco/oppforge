'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, MessageSquare, Zap, Hash, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

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

export default function OpportunityCard({ opp, index }) {
  const isUrgent = opp.deadline && new Date(opp.deadline) < new Date(Date.now() + 48 * 60 * 60 * 1000)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card group flex items-start gap-4 p-3 hover:bg-[var(--bg-mahogany)]/30 transition-colors"
    >
      {/* 1. Left: Score Indicator */}
      <div className="shrink-0 pt-1">
        <ScoreRing score={opp.score} />
      </div>

      {/* 2. Middle: Info Density */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--accent-holo)] bg-[var(--accent-holo)]/10 px-1.5 rounded-sm">
            {opp.type}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {opp.chain} // {opp.source}
          </span>
          {isUrgent && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
              <Clock size={10} /> 48H
            </span>
          )}
        </div>

        <Link href={`/dashboard/opportunity/${opp.id}`} className="group-hover:text-[var(--accent-forge)] transition-colors">
          <h3 className="text-sm font-bold text-white truncate pr-4">{opp.title}</h3>
        </Link>
        
        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
          {opp.summary}
        </p>
      </div>

      {/* 3. Right: Reward & Action */}
      <div className="shrink-0 text-right flex flex-col items-end gap-2">
        <div className="text-sm font-bold text-[var(--accent-amber)] font-mono">{opp.reward}</div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link 
            href={`/dashboard/opportunity/${opp.id}`}
            className="p-1.5 hover:bg-white/10 rounded-sm text-gray-400 hover:text-white"
          >
             <MessageSquare size={14} />
          </Link>
          <Link 
            href={`/dashboard/opportunity/${opp.id}`}
            className="p-1.5 bg-[var(--accent-forge)] text-black rounded-sm hover:brightness-110"
          >
             <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
