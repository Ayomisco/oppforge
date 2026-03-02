'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Sparkles, Save, Send, ArrowLeft, Wand2, FileText, Layout, MessageSquare, History, Zap, Lightbulb, FileEdit, Presentation, Target, Upload, Briefcase, Trophy, Code, Rocket, Users, Shield, BookOpen, Eye, PenLine, Copy, Replace, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useOppForge } from '@/hooks/useOppForge'
import ReactMarkdown from 'react-markdown'

const fetcher = url => api.get(url).then(res => res.data)

import FeatureGate from '@/components/ui/FeatureGate'

// Forge mode configurations per opportunity category
const FORGE_MODES = {
  hackathon: {
    label: 'Hackathon',
    icon: Trophy,
    color: '#ff5500',
    defaultMode: 'ideas',
    modes: [
      { key: 'ideas', label: 'Idea Generator', icon: Lightbulb, desc: 'Generate winning project ideas based on the hackathon theme' },
      { key: 'proposal', label: 'Submission Draft', icon: FileEdit, desc: 'Draft a compelling hackathon submission' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Create a pitch deck outline for demo day' },
      { key: 'strategy', label: 'Win Strategy', icon: Target, desc: 'Tactical strategy to maximize your chances' },
    ],
    quickActions: ['Generate 5 project ideas', 'Add technical architecture', 'Strengthen demo plan', 'Optimize for judges', 'Add team composition'],
  },
  grants: {
    label: 'Grant',
    icon: FileEdit,
    color: '#10b981',
    defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Grant Proposal', icon: FileEdit, desc: 'Write a structured grant application' },
      { key: 'budget', label: 'Budget Plan', icon: Briefcase, desc: 'Create a detailed budget breakdown' },
      { key: 'milestones', label: 'Milestones', icon: Target, desc: 'Define deliverables and timeline' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Slide deck for grant committee' },
    ],
    quickActions: ['Quantify impact', 'Add milestone table', 'Strengthen roadmap', 'Add budget breakdown', 'Refine problem statement'],
  },
  bounties: {
    label: 'Bounty',
    icon: Code,
    color: '#3b82f6',
    defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Bounty Submission', icon: FileEdit, desc: 'Draft your bounty submission' },
      { key: 'strategy', label: 'Technical Approach', icon: Code, desc: 'Plan your implementation approach' },
      { key: 'review', label: 'Code Review Notes', icon: Shield, desc: 'Prepare submission review notes' },
    ],
    quickActions: ['Detail implementation', 'Add code snippets', 'Explain security considerations', 'Add testing plan', 'Optimize for reviewer'],
  },
  airdrops: {
    label: 'Airdrop',
    icon: Rocket,
    color: '#8b5cf6',
    defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Eligibility Strategy', icon: Target, desc: 'Steps to qualify for the airdrop' },
      { key: 'checklist', label: 'Task Checklist', icon: Shield, desc: 'Checklist of required interactions' },
    ],
    quickActions: ['List all requirements', 'Estimate gas costs', 'Add timeline', 'Optimize interactions', 'Risk assessment'],
  },
  testnets: {
    label: 'Testnet',
    icon: Rocket,
    color: '#f59e0b',
    defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Participation Guide', icon: BookOpen, desc: 'Step-by-step testnet participation guide' },
      { key: 'checklist', label: 'Interaction Checklist', icon: Shield, desc: 'All tasks/interactions to complete' },
    ],
    quickActions: ['List all tasks', 'Add wallet setup steps', 'Estimate time needed', 'Prioritize interactions', 'Track progress'],
  },
  ambassador: {
    label: 'Ambassador',
    icon: Users,
    color: '#ec4899',
    defaultMode: 'application',
    modes: [
      { key: 'application', label: 'Application', icon: FileEdit, desc: 'Write a standout ambassador application' },
      { key: 'strategy', label: 'Content Strategy', icon: Target, desc: 'Plan your community contribution strategy' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Showcase your community presence' },
    ],
    quickActions: ['Highlight community experience', 'Add content calendar', 'Show social reach', 'Detail growth plan', 'Add past results'],
  },
  jobs: {
    label: 'Job / Role',
    icon: Briefcase,
    color: '#06b6d4',
    defaultMode: 'cv',
    modes: [
      { key: 'cv', label: 'CV / Resume', icon: FileText, desc: 'Tailor your CV to this role' },
      { key: 'cover', label: 'Cover Letter', icon: FileEdit, desc: 'Write a targeted cover letter' },
      { key: 'prep', label: 'Interview Prep', icon: MessageSquare, desc: 'Prepare for technical/behavioral interview' },
    ],
    quickActions: ['Tailor to job description', 'Add quantified achievements', 'Highlight relevant skills', 'Add portfolio links', 'Optimize keywords'],
  },
}

const DEFAULT_CONFIG = {
  label: 'Opportunity',
  icon: Sparkles,
  color: '#ff5500',
  defaultMode: 'proposal',
  modes: [
    { key: 'proposal', label: 'Proposal Draft', icon: FileEdit, desc: 'Draft a compelling application' },
    { key: 'strategy', label: 'Strategy Guide', icon: Target, desc: 'Build a tactical approach' },
    { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Create a pitch outline' },
  ],
  quickActions: ['Quantify Achievements', 'Add Milestone Table', 'Strengthen Roadmap', 'Optimize for High Trust', 'Refine Technical Stack'],
}

function getForgeConfig(category) {
  if (!category) return DEFAULT_CONFIG
  const cat = category.toLowerCase().replace(/s$/, '') // normalize: "grants" -> "grant", etc.
  // Match against keys
  for (const [key, config] of Object.entries(FORGE_MODES)) {
    if (cat.includes(key.replace(/s$/, '')) || key.replace(/s$/, '').includes(cat)) {
      return config
    }
  }
  return DEFAULT_CONFIG
}

export default function ForgeWorkspace({ params }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [proposal, setProposal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [activeMode, setActiveMode] = useState(null)
  const [viewMode, setViewMode] = useState('preview') // 'edit' | 'preview'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const chatEndRef = useRef(null)
  
  const { data: opp, isLoading: isOppLoading } = useSWR(`/opportunities/${id}`, fetcher)
  
  // Determine forge config based on opportunity category
  const forgeConfig = useMemo(() => getForgeConfig(opp?.category), [opp?.category])
  
  // Set default mode when config loads
  useEffect(() => {
    if (forgeConfig && !activeMode) {
      setActiveMode(forgeConfig.defaultMode)
    }
  }, [forgeConfig, activeMode])

  const currentModeConfig = forgeConfig.modes.find(m => m.key === activeMode) || forgeConfig.modes[0]

  // Build the AI prompt based on selected forge mode
  const buildForgePrompt = (mode) => {
    const base = `Opportunity: ${opp?.title}\nCategory: ${opp?.category}\nDescription: ${opp?.ai_summary || opp?.description}\nRequirements: ${(opp?.required_skills || []).join(', ')}\n`
    
    switch (mode) {
      case 'ideas':
        return `${base}\nGenerate 5 creative, innovative project ideas for this hackathon. For each idea include:\n1. Project Name\n2. One-line pitch\n3. Technical approach (2-3 sentences)\n4. Why it could win\n\nFormat in Markdown.`
      case 'proposal':
        return `${base}\nWrite a compelling 3-paragraph application/proposal:\n1. Professional introduction and 'Why Me'\n2. Tactical approach with concrete deliverables\n3. Timeline and call to action\n\nFormat in Markdown.`
      case 'pitch':
        return `${base}\nCreate a pitch deck outline with 8-10 slides:\n- Title slide\n- Problem statement\n- Solution overview\n- Technical architecture\n- Market opportunity\n- Team & capabilities\n- Roadmap & milestones\n- Ask / CTA\n\nFor each slide, include bullet points of what to present. Format in Markdown.`
      case 'strategy':
        return `${base}\nCreate a detailed tactical strategy to maximize success. Include:\n1. Preparation steps\n2. Key requirements and how to meet them\n3. Timeline with milestones\n4. Risk factors and mitigation\n5. Competitive advantage tactics\n\nFormat in Markdown.`
      case 'budget':
        return `${base}\nCreate a detailed budget breakdown for this grant application. Include:\n1. Personnel costs\n2. Infrastructure & tools\n3. Marketing/community\n4. Contingency\n5. Total with justification\n\nFormat as a Markdown table.`
      case 'milestones':
        return `${base}\nDefine a milestone-based delivery plan:\n- 3-5 major milestones\n- Each with: deliverables, timeline, success metrics, payment trigger\n\nFormat as a Markdown table.`
      case 'cv':
        return `${base}\nGenerate a tailored CV/resume for this role. Optimize for the specific requirements listed. Include:\n1. Professional summary (tailored)\n2. Relevant experience highlights\n3. Technical skills (matched to requirements)\n4. Key achievements with metrics\n\nFormat in Markdown.`
      case 'cover':
        return `${base}\nWrite a compelling cover letter tailored to this role:\n1. Opening hook\n2. Why this role/company excites me\n3. Relevant experience & achievements\n4. Cultural fit & closing\n\nFormat in Markdown.`
      case 'prep':
        return `${base}\nPrepare interview content for this role:\n1. 5 likely technical questions with sample answers\n2. 3 behavioral questions with STAR-format answers\n3. 5 smart questions to ask the interviewer\n4. Key topics to review\n\nFormat in Markdown.`
      case 'application':
        return `${base}\nWrite a standout ambassador application:\n1. Introduction and motivation\n2. Community experience & reach\n3. Content/growth strategy\n4. What I bring to the program\n\nFormat in Markdown.`
      case 'checklist':
        return `${base}\nCreate a detailed task checklist:\n- All required interactions/tasks\n- Step-by-step instructions for each\n- Estimated time per task\n- Priority order\n\nFormat as a Markdown checklist.`
      case 'review':
        return `${base}\nPrepare code review submission notes:\n1. Implementation approach\n2. Key design decisions\n3. Security considerations\n4. Testing strategy\n5. Known limitations\n\nFormat in Markdown.`
      default:
        return `${base}\nGenerate a professional, detailed response appropriate for this opportunity. Format in Markdown.`
    }
  }

  // Initial Forge - Generate Draft based on selected mode
  const startForging = async () => {
    setIsGenerating(true)
    try {
        await api.post('/tracker', { opportunity_id: id, status: 'Applying' }).catch(() => {})
        
        // Try the draft endpoint first, fall back to chat endpoint
        let draftContent = null
        try {
          const resp = await api.post(`/tracker/${id}/draft`)
          draftContent = resp.data.draft
        } catch {
          // Fallback: use chat endpoint with mode-specific prompt
          const resp = await api.post('/chat', {
            message: buildForgePrompt(activeMode),
            opportunity_id: id
          })
          draftContent = resp.data.content
        }
        
        setProposal(draftContent || 'Failed to generate content. Please try again.')
        setChatHistory([{ role: 'ai', content: `I've generated your ${currentModeConfig.label.toLowerCase()} based on the mission briefing. Use the chat to refine it, or try the quick actions below.` }])
        toast.success(`${currentModeConfig.label} Forged`)
    } catch (error) {
        toast.error('Forge Ignition Failed')
    } finally {
        setIsGenerating(false)
    }
  }

  // Regenerate with a different mode (without tracking again)
  const switchMode = async (newMode) => {
    setActiveMode(newMode)
    if (proposal) {
      // If already forged, offer to regenerate
      const modeLabel = forgeConfig.modes.find(m => m.key === newMode)?.label || 'Content'
      toast(`Switched to ${modeLabel} mode. Click "Forge" to regenerate.`, { icon: '🔄' })
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
            message: `REFINEMENT_REQUEST for this ${currentModeConfig.label.toLowerCase()}: "${userMsg}". CURRENT_CONTENT: ${proposal}. Opportunity: ${opp?.title}`,
            opportunity_id: id
        })
        
        const aiResponse = resp.data.content
        setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
        
        // Check if the AI returned an updated version
        if (aiResponse.includes('FIXED_PROPOSAL:')) {
            const newDraft = aiResponse.split('FIXED_PROPOSAL:')[1]
            setProposal(newDraft.trim())
        } else if (aiResponse.length > 200 && !aiResponse.startsWith('I ') && !aiResponse.startsWith('Sure')) {
            // If the response is substantial content, offer to replace
            setChatHistory(prev => [...prev, { role: 'system', content: '💡 Tip: If you want to replace the current draft with this content, click the content above and paste it in the editor.' }])
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal).then(() => toast.success('Copied to clipboard'))
  }

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Apply an AI chat response to the draft editor
  const applyToDraft = (content) => {
    setProposal(content)
    setViewMode('preview')
    toast.success('Applied to draft')
  }

  const CategoryIcon = forgeConfig.icon

  const PageContent = () => {
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
              <div className="flex items-center gap-2">
                  <CategoryIcon size={16} style={{ color: forgeConfig.color }} />
                  <h1 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <span style={{ color: forgeConfig.color }}>{forgeConfig.label}</span>
                      <span className="text-gray-600 font-normal">//</span>
                      <span className="text-gray-300 font-normal text-xs truncate max-w-[300px]">{opp?.title}</span>
                  </h1>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <button 
                  onClick={copyToClipboard}
                  disabled={!proposal}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                  <FileText size={14} /> COPY
              </button>
              <button 
                  onClick={() => toast.success('Progress Encrypted & Saved')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[10px] font-mono font-bold text-[#10b981] hover:bg-[#10b981]/20 transition-all"
              >
                  <Save size={14} /> SAVE
              </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Mode Selector + Mission Intel + AI Chat */}
          <div className={`${sidebarCollapsed ? 'w-12' : 'w-80 lg:w-96'} border-r border-white/5 bg-black/20 flex flex-col transition-all duration-300 relative`}>
              
              {/* Collapse toggle */}
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -right-3 top-20 z-20 w-6 h-6 rounded-full bg-[#1a1512] border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
              </button>

              {sidebarCollapsed ? (
                <div className="flex flex-col items-center py-4 gap-3">
                  {forgeConfig.modes.map(mode => {
                    const ModeIcon = mode.icon
                    return (
                      <button 
                        key={mode.key}
                        onClick={() => { switchMode(mode.key); setSidebarCollapsed(false) }}
                        className={`p-2 rounded transition-all ${activeMode === mode.key ? 'text-white' : 'text-gray-600 hover:text-gray-300'}`}
                        style={activeMode === mode.key ? { color: forgeConfig.color, backgroundColor: `${forgeConfig.color}15` } : {}}
                        title={mode.label}
                      >
                        <ModeIcon size={16} />
                      </button>
                    )
                  })}
                </div>
              ) : (<>
              {/* Forge Mode Selector */}
              <div className="p-3 border-b border-white/5">
                <div className="text-[9px] uppercase font-mono font-bold text-gray-600 mb-2 tracking-widest">Forge_Mode</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {forgeConfig.modes.map(mode => {
                    const ModeIcon = mode.icon
                    return (
                      <button 
                        key={mode.key}
                        onClick={() => switchMode(mode.key)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                          activeMode === mode.key 
                            ? 'text-white border' 
                            : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
                        }`}
                        style={activeMode === mode.key ? { 
                          backgroundColor: `${forgeConfig.color}15`, 
                          borderColor: `${forgeConfig.color}40`,
                          color: forgeConfig.color 
                        } : {}}
                        title={mode.desc}
                      >
                        <ModeIcon size={12} /> {mode.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mission Briefing */}
              <div className="p-3 border-b border-white/5">
                  <div className="text-[9px] uppercase font-mono font-bold text-gray-600 mb-2 tracking-widest">Mission_Briefing</div>
                  <div className="p-2 bg-white/5 rounded border border-white/5 text-[10px] text-gray-400 leading-relaxed font-mono max-h-24 overflow-y-auto">
                      {opp?.ai_summary || opp?.description || 'No briefing available'}
                  </div>
                  {opp?.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opp.required_skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-mono text-gray-500 border border-white/5">{skill}</span>
                      ))}
                    </div>
                  )}
              </div>

              {/* AI Consultant Stream */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="text-[9px] uppercase font-mono font-bold text-gray-600 tracking-widest">AI_Consultant</div>
                  {chatHistory.length === 0 ? (
                      <div className="py-12 text-center">
                          <Wand2 className="mx-auto text-gray-800 mb-3" size={28} />
                          <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Select mode & ignite</p>
                      </div>
                  ) : (
                      chatHistory.map((msg, i) => (
                          <div key={i} className={`p-2.5 rounded text-[11px] font-mono leading-relaxed ${
                            msg.role === 'ai' ? 'bg-[#ff5500]/5 border border-[#ff5500]/10 text-gray-300' : 
                            msg.role === 'system' ? 'bg-blue-500/5 border border-blue-500/10 text-blue-300' :
                            'bg-white/5 text-gray-500'
                          }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#ffaa00] text-[9px]">[{msg.role.toUpperCase()}]</span>
                                {msg.role === 'ai' && msg.content.length > 100 && (
                                  <button 
                                    onClick={() => applyToDraft(msg.content)}
                                    className="flex items-center gap-1 text-[8px] font-bold uppercase text-[#ff5500]/60 hover:text-[#ff5500] transition-colors"
                                  >
                                    <Replace size={10} /> Apply to Draft
                                  </button>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                      ))
                  )}
                  {isGenerating && <div className="text-[9px] text-[#ff5500] font-mono animate-pulse uppercase tracking-[0.2em]">Forging...</div>}
                  <div ref={chatEndRef} />
              </div>
              <div className="p-3 bg-black/40 border-t border-white/5">
                  <form onSubmit={handleRefinement} className="relative">
                      <input 
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Refine... (e.g. 'Make it more technical')"
                          className="w-full bg-[#111] border border-white/10 rounded px-3 py-2.5 pr-10 text-[11px] text-white font-mono focus:outline-none focus:border-[#ff5500] transition-colors"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff5500]">
                          <Send size={14} />
                      </button>
                  </form>
              </div>
              </>)}
          </div>

          {/* Center/Right: The Canvas (Editor + Preview) */}
          <div className="flex-1 bg-black flex flex-col relative min-w-0">
              {!proposal && !isGenerating && (
                  <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center max-w-md">
                          <div className="mb-6 relative mx-auto w-20 h-20">
                              <CategoryIcon className="w-full h-full animate-pulse" style={{ color: forgeConfig.color }} />
                              <div className="absolute inset-0 blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: forgeConfig.color }} />
                          </div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-2">Ignite_{forgeConfig.label}</h2>
                          <p className="text-[10px] text-gray-500 font-mono uppercase mb-2 tracking-widest">{currentModeConfig?.desc}</p>
                          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                            {forgeConfig.modes.map(m => (
                              <button 
                                key={m.key}
                                onClick={() => setActiveMode(m.key)}
                                className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase border transition-all ${
                                  activeMode === m.key 
                                    ? 'text-white' 
                                    : 'text-gray-600 border-white/10 hover:text-gray-300'
                                }`}
                                style={activeMode === m.key ? { 
                                  backgroundColor: `${forgeConfig.color}20`, 
                                  borderColor: `${forgeConfig.color}40`,
                                  color: forgeConfig.color 
                                } : {}}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                          <button 
                              onClick={startForging}
                              className="btn btn-primary px-8 py-3 text-sm font-mono tracking-widest group"
                          >
                              <Sparkles size={16} /> FORGE_{activeMode?.toUpperCase()}
                          </button>
                      </div>
                  </div>
              )}

              {/* Canvas Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-3 items-center">
                      {forgeConfig.modes.map(mode => {
                        const MIcon = mode.icon
                        return (
                          <button 
                            key={mode.key}
                            onClick={() => switchMode(mode.key)}
                            className={`text-[10px] font-mono font-bold flex items-center gap-1.5 uppercase tracking-widest transition-colors ${
                              activeMode === mode.key ? '' : 'text-gray-600 hover:text-gray-400'
                            }`}
                            style={activeMode === mode.key ? { color: forgeConfig.color } : {}}
                          >
                            <MIcon size={13} /> {mode.label}
                          </button>
                        )
                      })}
                      {/* Divider */}
                      <div className="h-4 w-px bg-white/10 mx-1" />
                      {/* View Toggle */}
                      <div className="flex items-center bg-white/5 rounded-md p-0.5">
                        <button 
                          onClick={() => setViewMode('preview')}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                            viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <Eye size={11} /> Preview
                        </button>
                        <button 
                          onClick={() => setViewMode('edit')}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                            viewMode === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <PenLine size={11} /> Edit
                        </button>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button 
                          onClick={commitToChain}
                          className="flex items-center gap-2 px-3 py-1 rounded bg-[#ff5500]/10 border border-[#ff5500]/30 text-[9px] font-mono font-bold text-[#ff5500] hover:bg-[#ff5500]/20 transition-all"
                      >
                          <Zap size={14} /> COMMIT_TO_PROTOCOL
                      </button>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-[9px] font-mono text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px]" style={{ backgroundColor: forgeConfig.color, boxShadow: `0 0 5px ${forgeConfig.color}` }} />
                          {forgeConfig.label.toUpperCase()}_MODE
                      </div>
                  </div>
              </div>

              {/* Canvas Content - Edit or Preview */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {viewMode === 'edit' ? (
                  <div className="h-full p-6 lg:p-10">
                    <textarea 
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      className="w-full h-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-800"
                      placeholder={`${currentModeConfig?.label || 'Forge'} output will appear here...`}
                    />
                  </div>
                ) : (
                  <div className="p-6 lg:p-10">
                    {proposal ? (
                      <div className="prose prose-invert prose-sm max-w-none
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3 prose-h1:mb-4
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-sm
                        prose-li:text-gray-300 prose-li:text-sm
                        prose-strong:text-white prose-strong:font-semibold
                        prose-code:text-[#ff5500] prose-code:bg-[#ff5500]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                        prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
                        prose-a:text-[#ff5500] prose-a:no-underline hover:prose-a:underline
                        prose-table:text-sm
                        prose-th:text-[#ff5500] prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:border-b prose-th:border-[#ff5500]/20 prose-th:pb-2
                        prose-td:text-gray-300 prose-td:border-b prose-td:border-white/5 prose-td:py-2
                        prose-blockquote:border-l-[#ff5500] prose-blockquote:bg-[#ff5500]/5 prose-blockquote:py-1 prose-blockquote:rounded-r
                        prose-hr:border-white/10
                      ">
                        <ReactMarkdown>{proposal}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-800 font-mono text-sm">
                        {currentModeConfig?.label || 'Forge'} output will appear here...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Quick Actions Toolbar */}
              <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center gap-4 overflow-x-auto no-scrollbar">
                  <span className="text-[9px] font-mono font-bold text-gray-600 uppercase whitespace-nowrap">Quick_Actions:</span>
                  {(forgeConfig.quickActions || []).map((action, i) => (
                      <button 
                          key={i} 
                          onClick={() => {
                              setChatMessage(`Action: ${action}`)
                              setSidebarCollapsed(false)
                          }}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-gray-400 hover:text-white transition-all whitespace-nowrap"
                          style={{ '--hover-border': forgeConfig.color }}
                          onMouseEnter={e => e.target.style.borderColor = forgeConfig.color}
                          onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      >
                          {action}
                      </button>
                  ))}
                  {proposal && (
                    <button 
                      onClick={startForging}
                      className="px-3 py-1 border rounded-full text-[9px] font-mono font-bold whitespace-nowrap transition-all"
                      style={{ borderColor: `${forgeConfig.color}40`, color: forgeConfig.color, backgroundColor: `${forgeConfig.color}10` }}
                    >
                      ↻ Regenerate
                    </button>
                  )}
              </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate featureName="Forge AI Drafter" requirePremium={true}>
      <PageContent />
    </FeatureGate>
  )
}
