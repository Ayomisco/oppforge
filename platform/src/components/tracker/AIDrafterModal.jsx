'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Copy, Check, RotateCcw, FileText } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

export default function AIDrafterModal({ mission, isOpen, onClose }) {
  const [draft, setDraft] = useState('')
  const [isForging, setIsForging] = useState(false)
  const [copied, setCopied] = useState(false)

  const forgeDraft = async () => {
    setIsForging(true)
    try {
      const { data } = await api.post(`/tracker/${mission.id}/draft`)
      setDraft(data.draft)
    } catch (err) {
      toast.error("Forge failed... Interference detected.")
    } finally {
      setIsForging(false)
    }
  }

  useEffect(() => {
    if (isOpen && mission) {
      if (mission.ai_strategy_notes) {
        setDraft(mission.ai_strategy_notes)
      } else {
        setDraft('')
      }
    }
  }, [isOpen, mission])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    toast.success("Intelligence copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col border-[#ff5500]/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#ff5500]/10 rounded-lg">
                <Zap size={20} className="text-[#ff5500]" fill="currentColor" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white tracking-tight">Mission Copilot</h2>
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Forging Application Draft for: {mission?.title}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(255,85,0,0.05),transparent)]">
          {!draft && !isForging ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-20 h-20 rounded-full border border-dashed border-[#ff5500]/30 flex items-center justify-center animate-spin-slow">
                  <FileText size={40} className="text-gray-700" />
               </div>
               <div className="max-w-xs space-y-2">
                 <h3 className="text-white font-bold">New Mission Detected</h3>
                 <p className="text-xs text-gray-500">I will analyze your skills and the mission briefings to forge a high-fidelity proposal.</p>
               </div>
               <button 
                 onClick={forgeDraft}
                 className="btn btn-primary px-8 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.2)] flex items-center gap-2 group font-bold"
               >
                 Execute Forge <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          ) : isForging ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                   <Zap size={48} className="text-[#ff5500] animate-pulse" fill="currentColor" />
                   <div className="absolute inset-0 bg-[#ff5500] blur-2xl opacity-20 animate-pulse" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-bold text-white">Forging Strategy...</p>
                  <p className="text-[10px] font-mono text-gray-500 animate-pulse">ALGORITHMIC_RECON_ACTIVE</p>
                </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert prose-orange max-w-none text-gray-300 font-sans"
            >
              <ReactMarkdown>{draft}</ReactMarkdown>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {draft && (
          <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center">
             <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">
                COPILOT_v2.0 // HIGH_FIDELITY_INTEL
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={forgeDraft}
                  disabled={isForging}
                  className="px-4 py-2 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                >
                  <RotateCcw size={14} /> Re-Forge
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 sm:flex-none btn btn-primary px-6 rounded-xl flex items-center justify-center gap-2 font-black transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Transfer Intel'}
                </button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
