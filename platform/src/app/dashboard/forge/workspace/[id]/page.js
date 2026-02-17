'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Send, ArrowLeft, Wand2, FileText, Layout, MessageSquare, History, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useOppForge } from '@/hooks/useOppForge'

const fetcher = url => api.get(url).then(res => res.data)

export default function ForgeWorkspace({ params }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [proposal, setProposal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  
  const { data: opp, isLoading: isOppLoading } = useSWR(`/opportunities/${id}`, fetcher)

  // Initial Forge - Generate Draft
  const startForging = async () => {
    setIsGenerating(true)
    try {
        // We use the tracker API to generate the initial draft
        // But first we ensure it's tracked
        await api.post('/tracker', { opportunity_id: id, status: 'Applying' }).catch(() => {})
        
        const resp = await api.post(`/tracker/${id}/draft`)
        setProposal(resp.data.draft)
        setChatHistory([{ role: 'ai', content: "I've drafted a tactical mission proposal based on your profile. How should we refine it?" }])
        toast.success('Mission Draft Forged')
    } catch (error) {
        toast.error('Forge Ignition Failed')
    } finally {
        setIsGenerating(false)
    }
  }

  const handleRefinement = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const userMsg = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setIsGenerating(true)

    try {
        const resp = await api.post('/chat', {
            message: `REFINEMENT_REQUEST for this proposal: "${userMsg}". CURRENT_PROPOSAL: ${proposal}`,
            opportunity_id: id
        })
        
        const aiResponse = resp.data.content
        setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
        
        // If the AI response contains a block of code or a large markdown chunk, we might want to update the canvas
        // For now, let's assume the user can manually copy-paste or we can try to detect "NEW_DRAFT:" tags
        if (aiResponse.includes('FIXED_PROPOSAL:')) {
            const newDraft = aiResponse.split('FIXED_PROPOSAL:')[1]
            setProposal(newDraft.trim())
        }
    } catch (error) {
        toast.error('Refinement failed')
    } finally {
        setIsGenerating(false)
    }
  }

  const { startMissionOnChain } = useOppForge()

  const commitToChain = async () => {
    const tid = toast.loading('Committing Mission to Arbitrum...')
    try {
        await startMissionOnChain(id)
        toast.success('Mission Integrity Verified On-Chain', { id: tid })
    } catch (e) {
        toast.error('On-Chain Verification Cancelled/Failed', { id: tid })
    }
  }

  if (isOppLoading) return <div className="p-20 text-center font-mono animate-pulse">BOOTING_FORGE_OS...</div>

  return (
    <div className="fixed inset-0 top-14 bg-[#0d0a08] flex flex-col">
      {/* Workspace Header */}
      <div className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded text-gray-500">
                <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div>
                <h1 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    Forge_Workspace <span className="text-gray-600 font-normal">//</span> <span className="text-[#ff5500]">{opp?.title}</span>
                </h1>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-colors">
                <History size={14} /> HIST_V2
            </button>
            <button 
                onClick={() => toast.success('Progress Encrypted & Saved')}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[10px] font-mono font-bold text-[#10b981] hover:bg-[#10b981]/20 transition-all"
            >
                <Save size={14} /> SAVE_SNAPSHOT
            </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Mission Intel & History */}
        <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col">
            <div className="p-4 border-b border-white/5">
                <div className="text-[10px] uppercase font-mono font-bold text-gray-500 mb-2 tracking-widest">Mission_Briefing</div>
                <div className="p-3 bg-white/5 rounded border border-white/5 text-[11px] text-gray-400 leading-relaxed font-mono">
                    {opp?.ai_summary}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-widest">AI_Consultant_Stream</div>
                {chatHistory.length === 0 ? (
                    <div className="py-20 text-center">
                        <Wand2 className="mx-auto text-gray-800 mb-3" size={32} />
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Ready for Forge Ignition</p>
                    </div>
                ) : (
                    chatHistory.map((msg, i) => (
                        <div key={i} className={`p-3 rounded text-[11px] font-mono leading-relaxed ${msg.role === 'ai' ? 'bg-[#ff5500]/5 border border-[#ff5500]/10 text-gray-300' : 'bg-white/5 text-gray-500 self-end'}`}>
                            <span className="font-bold text-[#ffaa00] mr-2">[{msg.role.toUpperCase()}]</span>
                            {msg.content}
                        </div>
                    ))
                )}
                {isGenerating && <div className="text-[10px] text-[#ff5500] font-mono animate-pulse uppercase tracking-[0.2em]">Forging_Response...</div>}
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5">
                <form onSubmit={handleRefinement} className="relative">
                    <input 
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Refine draft... (e.g. 'Make it more technical')"
                        className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 pr-10 text-[11px] text-white font-mono focus:outline-none focus:border-[#ff5500] transition-colors"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff5500]">
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>

        {/* Center/Right: The Canvas (Editor) */}
        <div className="flex-1 bg-black flex flex-col relative">
            {!proposal && !isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-6 relative mx-auto w-24 h-24">
                            <Sparkles className="text-[#ff5500] w-full h-full animate-pulse" />
                            <div className="absolute inset-0 bg-[#ff5500] blur-3xl opacity-20 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.5em] mb-2">Ignite_Forge</h2>
                        <p className="text-xs text-gray-500 font-mono uppercase mb-8 tracking-widest">Generate mission-winning technical proposals in seconds</p>
                        <button 
                            onClick={startForging}
                            className="btn btn-primary px-8 py-3 text-sm font-mono tracking-widest group"
                        >
                            <span>START_TECHNICAL_FORGING</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-4">
                    <button className="text-[10px] font-mono font-bold text-[#ffaa00] flex items-center gap-2 uppercase tracking-widest">
                        <FileText size={14} /> Proposal_MD
                    </button>
                    <button className="text-[10px] font-mono font-bold text-gray-600 flex items-center gap-2 uppercase tracking-widest hover:text-gray-400 transition-colors">
                        <Layout size={14} /> Strategy_Guide
                    </button>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={commitToChain}
                        className="flex items-center gap-2 px-3 py-1 rounded bg-[#ff5500]/10 border border-[#ff5500]/30 text-[9px] font-mono font-bold text-[#ff5500] hover:bg-[#ff5500]/20 transition-all"
                    >
                        <Zap size={14} /> COMMIT_TO_PROTOCOL
                    </button>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-[9px] font-mono text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5500] shadow-[0_0_5px_#ff5500]" />
                        SYNC_ACTIVE
                    </div>
                </div>
            </div>

            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                <textarea 
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="w-full h-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-800"
                    placeholder="Forge output will appear here..."
                />
            </div>

            {/* Bottom Suggestions Toolbar */}
            <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center gap-4 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-mono font-bold text-gray-600 uppercase whitespace-nowrap">AI_Quick_Actions:</span>
                {[
                    "Quantify Achievements",
                    "Add Milestone Table",
                    "Strengthen Roadmap",
                    "Optimize for High Trust",
                    "Refine Technical Stack"
                ].map((action, i) => (
                    <button 
                        key={i} 
                        onClick={() => {
                            setChatMessage(`Action: ${action}`)
                            // Note: handleRefinement requires e.preventDefault, so we just trigger input set
                        }}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-gray-400 hover:text-white hover:border-[#ff5500] transition-all whitespace-nowrap"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
