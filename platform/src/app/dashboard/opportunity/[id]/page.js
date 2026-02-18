'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Globe, Shield, Zap, ExternalLink, ShieldCheck, Trash2, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatMissionDeadline, getTrustStatus } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'
import { useWriteContract, useAccount } from 'wagmi'
import { parseEther, keccak256, encodePacked } from 'viem'

import { LoginModal } from '@/components/auth/LoginModal'
import { useState } from 'react'

const fetcher = url => api.get(url).then(res => res.data)

export default function OpportunityDetail({ params }) {
  const { id } = use(params)
  const { user, isGuest } = useAuth()
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  
  // Guard Clause: Don't fetch if ID is invalid
  const shouldFetch = id && id !== 'undefined'
  const { data: opp, error, isLoading, mutate } = useSWR(shouldFetch ? `/opportunities/${id}` : null, fetcher)

  const handleVerify = async () => {
    try {
      await api.patch(`/opportunities/${id}/verify`)
      toast.success('Mission Verified')
      mutate()
    } catch (error) {
      toast.error('Failed to verify')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Abort this mission permanently?')) return
    try {
      await api.delete(`/opportunities/${id}`)
      toast.success('Mission Purged')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const { writeContractAsync } = useWriteContract()
  const { isConnected } = useAccount()

  const handleFund = async () => {
    if (!isConnected) {
        toast.error("Connect Wallet to fund mission");
        return;
    }
    const amount = prompt("Enter reward amount in ETH (e.g. 0.01):");
    if (!amount) return;

    const tid = toast.loading(`Funding Mission on Arbitrum...`);
    try {
        const missionIdBytes = keccak256(encodePacked(['string'], [id]));
        await writeContractAsync({
            address: '0x0000000000000000000000000000000000000000', // Protocol Address
            abi: [{
                "inputs": [{"internalType": "bytes32", "name": "_missionId", "type": "bytes32"}],
                "name": "fundMission",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }],
            functionName: 'fundMission',
            args: [missionIdBytes],
            value: parseEther(amount)
        });
        toast.success('Funds Secured On-Chain', { id: tid });
    } catch (e) {
        toast.error('Funding failed', { id: tid });
    }
  }

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

  const deadlineLabel = formatMissionDeadline(opp.deadline)
  const isExpired = deadlineLabel === "EXPIRED"
  const trust = getTrustStatus(opp.trust_score || (opp.is_verified ? 95 : 60))

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
              <div 
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border"
                style={{ color: trust.color, borderColor: `${trust.color}44`, backgroundColor: trust.bg }}
              >
                 <ShieldCheck size={12} /> {trust.label}
              </div>
            </div>
            
            <h1 className="text-4xl font-black mb-4 leading-tight text-white tracking-tight">{opp.title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-500">
                <Globe size={14} className="text-[#ff5500]" /> {opp.source.toUpperCase()}
              </div>
              <div className={`flex items-center gap-2 ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                <Clock size={14} className="text-[#ff5500]" /> 
                <span className={isExpired ? 'animate-pulse' : ''}>{isExpired ? 'MISSION_EXPIRED' : `CLOSING_IN: ${deadlineLabel.toUpperCase()}`}</span>
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
                {(opp.requirements?.length > 0 ? opp.requirements : ["Technical Proficiency", "Ecosystem Alignment", "Active Participation"]).map((req, i) => (
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
            id={id}
            score={opp.score}
            probability={opp.win_probability}
            summary={opp.summary}
            strategy={opp.strategy}
            trust={opp.trust_score}
          />

            {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => {
                if (isGuest) setIsLoginOpen(true);
                else window.open(opp.url, '_blank');
              }}
              className="btn btn-primary w-full justify-between items-center group py-4 px-6 text-sm"
            >
              DEPLOY_NOW <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                if (isGuest) setIsLoginOpen(true);
                else router.push(`/dashboard/forge/workspace/${id}`);
              }}
              className="btn btn-primary w-full justify-center py-4 text-sm font-mono group"
            >
              <span>ENTER_FORGE_WORKSPACE</span> <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
            
            {user?.role === 'admin' && (
              <div className="pt-4 space-y-3">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Admin_Actions</div>
                {!opp.is_verified && (
                  <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded text-[#10b981] text-xs font-mono uppercase hover:bg-[#10b981]/20 transition-all"
                  >
                    <span>Verify_Mission</span>
                    <ShieldCheck size={16} />
                  </button>
                )}
                <button 
                  onClick={handleFund}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#ff5500]/10 border border-[#ff5500]/20 rounded text-[#ffaa00] text-xs font-mono uppercase hover:bg-[#ff5500]/20 transition-all"
                >
                  <span>Bank_Protocol_Funding</span>
                  <Zap size={16} />
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono uppercase hover:bg-red-500/20 transition-all"
                >
                  <span>Abort_Mission</span>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
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
              <span className="text-white">{opp.created_at ? format(new Date(opp.created_at), 'MMM dd, yyyy') : 'JUST NOW'}</span>
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

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        triggerText="Unlock This Mission"
      />
    </div>
  )
}
