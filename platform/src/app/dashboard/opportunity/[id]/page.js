'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Globe, Shield, ExternalLink, ShieldCheck, Trash2, Sparkles, Bookmark, BookmarkCheck, Calendar, DollarSign, Tag, Info } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import api from '@/lib/api'
import { formatMissionDeadline, getTrustStatus } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'
import { getOppImage } from '@/lib/chainLogos'
import { useWriteContract, useAccount } from 'wagmi'
import { parseEther, keccak256, encodePacked } from 'viem'
import { CONTRACTS, MISSION_ABI, PAYMENT_CHAIN } from '@/lib/contracts'

import { LoginModal } from '@/components/auth/LoginModal'
import { useState } from 'react'

const fetcher = url => api.get(url).then(res => res.data)

export default function OpportunityDetail({ params }) {
  const { id } = use(params)
  const { user, isGuest } = useAuth()
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Guard Clause: Don't fetch if ID is invalid
  const shouldFetch = id && id !== 'undefined'
  const { data: opp, error, isLoading, mutate } = useSWR(shouldFetch ? `/opportunities/${id}` : null, fetcher)
  
  // Check if already tracked
  const { data: trackedApps } = useSWR(!isGuest ? '/tracker' : null, fetcher, {
    onSuccess: (data) => {
      if (data?.some(app => app.opportunity?.id === id)) setIsSaved(true)
    }
  })

  const handleSaveToTracker = async () => {
    if (isGuest) { setIsLoginOpen(true); return }
    if (isSaved) { router.push('/dashboard/tracker'); return }
    setIsSaving(true)
    try {
      await api.post('/tracker', { opportunity_id: id, status: 'Interested' })
      setIsSaved(true)
      toast.success('Saved to your tracker!')
    } catch (err) {
      if (err?.response?.status === 400) {
        setIsSaved(true)
        toast.success('Already in your tracker')
      } else {
        toast.error('Failed to save')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerify = async () => {
    try {
      await api.patch(`/opportunities/${id}/verify`)
      toast.success('Opportunity verified')
      mutate()
    } catch (error) {
      toast.error('Failed to verify')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this opportunity permanently?')) return
    try {
      await api.delete(`/opportunities/${id}`)
      toast.success('Opportunity deleted')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const { writeContractAsync } = useWriteContract()
  const { isConnected } = useAccount()

  const handleFund = async () => {
    if (!isConnected) {
        toast.error("Connect your wallet first");
        return;
    }
    const amount = prompt("Enter reward amount in ETH (e.g. 0.01):");
    if (!amount) return;

    const tid = toast.loading('Funding on Arbitrum...');
    try {
        const missionIdBytes = keccak256(encodePacked(['string'], [id]));
        await writeContractAsync({
            address: CONTRACTS.MISSION.address,
            abi: MISSION_ABI,
            functionName: 'fundMission',
            args: [missionIdBytes],
            value: parseEther(amount),
            chainId: PAYMENT_CHAIN.id,
        });
        toast.success('Funded on-chain!', { id: tid });
    } catch (e) {
        toast.error('Funding failed', { id: tid });
    }
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-pulse">
      <div className="h-4 w-24 bg-white/5 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 w-3/4 bg-white/5 rounded" />
          <div className="h-40 bg-white/5 rounded-xl" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    </div>
  )

  if (error || !opp) return (
    <div className="max-w-5xl mx-auto py-20 text-center px-4">
      <p className="text-gray-500 mb-4">Opportunity not found.</p>
      <Link href="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
    </div>
  )

  const deadlineLabel = formatMissionDeadline(opp.deadline)
  const isExpired = deadlineLabel === "EXPIRED"
  const trust = getTrustStatus(opp.trust_score || (opp.is_verified ? 95 : 60))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0 pb-20">
      {/* Back Nav */}
      <Link href="/dashboard/feed" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        <span>Back to Feed</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Content (Left, 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#ffaa00] bg-[#ffaa00]/10 px-3 py-1.5 rounded-lg border border-[#ffaa00]/20">
                {opp.category}
              </span>
              <span className="text-xs font-medium text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                {opp.chain}
              </span>
              <div 
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ color: trust.color, borderColor: `${trust.color}33`, backgroundColor: trust.bg }}
              >
                 <ShieldCheck size={13} /> {trust.label}
              </div>
            </div>
            
            {/* Title + Logo */}
            <div className="flex items-center gap-4">
              {(() => {
                const logoUrl = getOppImage(opp)
                return logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={opp.chain || opp.source || ''}
                    className="w-12 h-12 rounded-xl object-contain bg-white/5 border border-white/10 p-1.5 shrink-0"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : null
              })()}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">{opp.title}</h1>
            </div>
            
            {/* Key Info Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Globe size={15} className="text-[#ff5500]" /> {opp.source}
              </div>
              <div className={`flex items-center gap-2 text-sm ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                <Calendar size={15} className="text-[#ff5500]" /> 
                <span>{isExpired ? 'Expired' : `Closes ${deadlineLabel}`}</span>
              </div>
              {(opp.reward_pool) && (
                <div className="flex items-center gap-2 text-sm font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/20">
                  <DollarSign size={15} /> {opp.reward_pool}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-5 sm:p-8 border-l-4 border-l-[#ff5500] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff5500]/5 blur-[100px] rounded-full pointer-events-none" />
            <h3 className="text-sm font-semibold text-[#ff5500] mb-4 flex items-center gap-2">
              <Info size={16} /> Overview
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line leading-relaxed text-[15px]">
              {opp.description}
            </div>
          </div>

          {/* Requirements & Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Requirements */}
            <div className="glass-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Shield size={15} /> Requirements
              </h3>
              <div className="space-y-3">
                {(opp.requirements?.length > 0 ? opp.requirements : ["Technical proficiency", "Ecosystem experience", "Active participation"]).map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#ff5500] shrink-0" />
                    <span className="text-sm text-gray-400 leading-relaxed">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="glass-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Tag size={15} /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {(opp.tags?.length > 0 ? opp.tags : ["Web3", "Builder"]).map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-gray-400 border border-white/10 hover:border-[#ffaa00]/40 hover:text-white transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar (Right, 4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel 
            id={id}
            score={opp.score}
            probability={opp.win_probability}
            summary={opp.summary}
            strategy={opp.strategy}
            trust={opp.trust_score}
          />

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Apply Now — primary action */}
            <button 
              onClick={() => {
                if (isGuest) setIsLoginOpen(true);
                else window.open(opp.url, '_blank');
              }}
              className="btn btn-primary w-full justify-between items-center group py-4 px-5 text-sm font-semibold rounded-xl"
            >
              Apply Now <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Save to Tracker */}
            <button 
              onClick={handleSaveToTracker}
              disabled={isSaving}
              className={`w-full flex items-center justify-between py-3.5 px-5 rounded-xl text-sm font-semibold border transition-all ${
                isSaved 
                  ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/20' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span>{isSaved ? 'Saved — View Tracker' : 'Save to Tracker'}</span>
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>

            {/* Open Workspace */}
            <button 
              onClick={() => {
                if (isGuest) setIsLoginOpen(true);
                else router.push(`/dashboard/forge/workspace/${id}`);
              }}
              className="w-full flex items-center justify-between py-3.5 px-5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-[#ff5500]/10 hover:border-[#ff5500]/30 hover:text-[#ff5500] transition-all group"
            >
              <span>Open AI Workspace</span> <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
            
            {/* Admin Actions */}
            {user?.role === 'admin' && (
              <div className="pt-3 space-y-2.5 border-t border-white/5">
                <p className="text-xs font-medium text-gray-600 mb-2">Admin</p>
                {!opp.is_verified && (
                  <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm font-medium hover:bg-[#10b981]/20 transition-all"
                  >
                    <span>Verify</span>
                    <ShieldCheck size={16} />
                  </button>
                )}
                <button 
                  onClick={handleFund}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#ff5500]/10 border border-[#ff5500]/20 rounded-xl text-[#ffaa00] text-sm font-medium hover:bg-[#ff5500]/20 transition-all"
                >
                  <span>Fund on Chain</span>
                  <DollarSign size={16} />
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  <span>Delete</span>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="glass-card p-5 space-y-3.5 text-sm">
             <h4 className="text-xs font-semibold text-gray-500 pb-2 border-b border-white/5">Details</h4>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Added</span>
              <span className="text-white font-medium">{opp.created_at ? format(new Date(opp.created_at), 'MMM dd, yyyy') : 'Recently'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Source</span>
              <span className="text-[#ff5500] font-medium">{opp.source}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-gray-500">Chain</span>
               <span className="text-white font-medium">{opp.chain}</span>
            </div>
            {opp.is_verified && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className="text-[#10b981] font-medium flex items-center gap-1"><ShieldCheck size={13} /> Verified</span>
              </div>
            )}
          </div>

        </div>

      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        triggerText="Sign in to continue"
      />
    </div>
  )
}
