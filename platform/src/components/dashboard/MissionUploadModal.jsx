'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Shield, Globe, Cpu, Target, HelpCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function MissionUploadModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Grant',
    chain: 'Multi-chain',
    reward_pool: '',
    deadline: '',
    mission_requirements: ''
  })

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-mission-upload', handleOpen)
    return () => window.removeEventListener('open-mission-upload', handleOpen)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Process requirements into array
      const payload = {
        ...formData,
        source: 'manual',
        mission_requirements: formData.mission_requirements.split('\n').filter(r => r.trim()),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      }

      await api.post('/opportunities/', payload)
      toast.success('Mission Deployed Successfully!')
      setIsOpen(false)
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'Grant',
        chain: 'Multi-chain',
        reward_pool: '',
        deadline: '',
        mission_requirements: ''
      })
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to deploy mission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0d0a08] border border-[#ff5500]/30 shadow-[0_0_50px_rgba(255,85,0,0.15)] rounded-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#ff5500]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff5500]/20 rounded text-[#ff5500]">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">Manual Mission Deployment</h2>
              <p className="text-[10px] text-gray-500 font-mono">ADMIN_ACCESS: GRANTED</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold font-mono text-gray-400 flex items-center gap-2">
                <Target size={12} className="text-[#ff5500]" /> Mission Title
              </label>
              <input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Arbitrum Foundation Grant"
                className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                type="text" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold font-mono text-gray-400 flex items-center gap-2">
                <Globe size={12} className="text-[#ff5500]" /> Target URL
              </label>
              <input 
                required
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://..."
                className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                type="url" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold font-mono text-gray-400 flex items-center gap-2">
              <HelpCircle size={12} className="text-[#ff5500]" /> Objective / Description
            </label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Briefly describe the mission objective..."
              className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] transition-colors resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold font-mono text-gray-400">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
                >
                  <option>Grant</option>
                  <option>Hackathon</option>
                  <option>Bounty</option>
                  <option>Testnet</option>
                  <option>Airdrop</option>
                  <option>Job</option>
                  <option>Ambassador</option>
                  <option>Ecosystem</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold font-mono text-gray-400">Blockchain Network</label>
                <select 
                   value={formData.chain}
                   onChange={(e) => setFormData({...formData, chain: e.target.value})}
                   className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
                >
                  <option>Multi-chain</option>
                  <option>Solana</option>
                  <option>Arbitrum</option>
                  <option>Optimism</option>
                  <option>Base</option>
                  <option>Ethereum</option>
                  <option>Sui</option>
                  <option>Monad</option>
                  <option>Berachain</option>
                  <option>Aptos</option>
                  <option>Avalanche</option>
                  <option>Bitcoin</option>
                  <option>Polygon</option>
                  <option>Injective</option>
                  <option>Sei</option>
                </select>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold font-mono text-gray-400">Reward Pool</label>
              <input 
                value={formData.reward_pool}
                onChange={(e) => setFormData({...formData, reward_pool: e.target.value})}
                placeholder="e.g. $10,000 + Tokens"
                className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold font-mono text-gray-400">Deadline</label>
              <input 
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold font-mono text-gray-400">Requirements (One per line)</label>
            <textarea 
              rows={4}
              value={formData.mission_requirements}
              onChange={(e) => setFormData({...formData, mission_requirements: e.target.value})}
              placeholder="e.g. Must be open source&#10;Must use Arbitrum SDK&#10;Deployed on Testnet"
              className="w-full bg-[#1a1512] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500] transition-colors resize-none"
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full mt-4 bg-[#ff5500] hover:bg-[#ff6611] disabled:opacity-50 text-black font-bold py-3 rounded uppercase font-mono text-xs tracking-widest flex items-center justify-center gap-2 group transition-all"
          >
            {isSubmitting ? 'Deploying...' : (
              <>
                <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Initialize Mission Deployment
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
