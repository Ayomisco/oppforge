'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Sparkles, Save, Send, ArrowLeft, Wand2, FileText, MessageSquare, Lightbulb, FileEdit, Presentation, Target, Briefcase, Trophy, Code, Rocket, Users, Shield, BookOpen, Eye, PenLine, Copy, Replace, Download, Menu, X, RefreshCw } from 'lucide-react'
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
      { key: 'ideas', label: 'Ideas', icon: Lightbulb, desc: 'Generate winning project ideas' },
      { key: 'proposal', label: 'Submission', icon: FileEdit, desc: 'Draft a hackathon submission' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Create a pitch deck outline' },
      { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Strategy to maximize your chances' },
    ],
    quickActions: ['Generate 5 project ideas', 'Add technical architecture', 'Strengthen demo plan', 'Optimize for judges', 'Add team composition'],
  },
  grants: {
    label: 'Grant',
    icon: FileEdit,
    color: '#10b981',
    defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Proposal', icon: FileEdit, desc: 'Write a grant application' },
      { key: 'budget', label: 'Budget', icon: Briefcase, desc: 'Create a budget breakdown' },
      { key: 'milestones', label: 'Milestones', icon: Target, desc: 'Define deliverables and timeline' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Deck for grant committee' },
    ],
    quickActions: ['Quantify impact', 'Add milestone table', 'Strengthen roadmap', 'Add budget breakdown', 'Refine problem statement'],
  },
  bounties: {
    label: 'Bounty',
    icon: Code,
    color: '#3b82f6',
    defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Submission', icon: FileEdit, desc: 'Draft your bounty submission' },
      { key: 'strategy', label: 'Approach', icon: Code, desc: 'Plan your implementation' },
      { key: 'review', label: 'Review Notes', icon: Shield, desc: 'Prepare review notes' },
    ],
    quickActions: ['Detail implementation', 'Add code snippets', 'Explain security considerations', 'Add testing plan', 'Optimize for reviewer'],
  },
  airdrops: {
    label: 'Airdrop',
    icon: Rocket,
    color: '#8b5cf6',
    defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Steps to qualify' },
      { key: 'checklist', label: 'Checklist', icon: Shield, desc: 'Required interactions' },
    ],
    quickActions: ['List all requirements', 'Estimate gas costs', 'Add timeline', 'Optimize interactions', 'Risk assessment'],
  },
  testnets: {
    label: 'Testnet',
    icon: Rocket,
    color: '#f59e0b',
    defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Guide', icon: BookOpen, desc: 'Participation guide' },
      { key: 'checklist', label: 'Checklist', icon: Shield, desc: 'Tasks to complete' },
    ],
    quickActions: ['List all tasks', 'Add wallet setup steps', 'Estimate time needed', 'Prioritize interactions', 'Track progress'],
  },
  ambassador: {
    label: 'Ambassador',
    icon: Users,
    color: '#ec4899',
    defaultMode: 'application',
    modes: [
      { key: 'application', label: 'Application', icon: FileEdit, desc: 'Write an ambassador application' },
      { key: 'strategy', label: 'Content Plan', icon: Target, desc: 'Community strategy' },
      { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Showcase your presence' },
    ],
    quickActions: ['Highlight community experience', 'Add content calendar', 'Show social reach', 'Detail growth plan', 'Add past results'],
  },
  jobs: {
    label: 'Job / Role',
    icon: Briefcase,
    color: '#06b6d4',
    defaultMode: 'cv',
    modes: [
      { key: 'cv', label: 'CV / Resume', icon: FileText, desc: 'Tailor your CV' },
      { key: 'cover', label: 'Cover Letter', icon: FileEdit, desc: 'Write a cover letter' },
      { key: 'prep', label: 'Interview Prep', icon: MessageSquare, desc: 'Prepare for interviews' },
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
    { key: 'proposal', label: 'Proposal', icon: FileEdit, desc: 'Draft a compelling application' },
    { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Build a tactical approach' },
    { key: 'pitch', label: 'Pitch Deck', icon: Presentation, desc: 'Create a pitch outline' },
  ],
  quickActions: ['Quantify achievements', 'Add milestone table', 'Strengthen roadmap', 'Add technical detail', 'Refine summary'],
}

function getForgeConfig(category) {
  if (!category) return DEFAULT_CONFIG
  const cat = category.toLowerCase().replace(/s$/, '')
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
  const [viewMode, setViewMode] = useState('preview')
  const [showChat, setShowChat] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  
  const { data: opp, isLoading: isOppLoading } = useSWR(`/opportunities/${id}`, fetcher)
  
  const forgeConfig = useMemo(() => getForgeConfig(opp?.category), [opp?.category])
  
  useEffect(() => {
    if (forgeConfig && !activeMode) {
      setActiveMode(forgeConfig.defaultMode)
    }
  }, [forgeConfig, activeMode])

  // On desktop, show chat panel by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowChat(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentModeConfig = forgeConfig.modes.find(m => m.key === activeMode) || forgeConfig.modes[0]

  const buildForgePrompt = (mode) => {
    const base = `Opportunity: ${opp?.title}\nCategory: ${opp?.category}\nDescription: ${opp?.ai_summary || opp?.description}\nRequirements: ${(opp?.required_skills || []).join(', ')}\n`
    
    const prompts = {
      ideas: `${base}\nGenerate 5 creative, innovative project ideas for this hackathon. For each idea include:\n1. Project Name\n2. One-line pitch\n3. Technical approach (2-3 sentences)\n4. Why it could win\n\nFormat in Markdown.`,
      proposal: `${base}\nWrite a compelling 3-paragraph application/proposal:\n1. Professional introduction and 'Why Me'\n2. Tactical approach with concrete deliverables\n3. Timeline and call to action\n\nFormat in Markdown.`,
      pitch: `${base}\nCreate a pitch deck outline with 8-10 slides:\n- Title slide\n- Problem statement\n- Solution overview\n- Technical architecture\n- Market opportunity\n- Team & capabilities\n- Roadmap & milestones\n- Ask / CTA\n\nFor each slide, include bullet points. Format in Markdown.`,
      strategy: `${base}\nCreate a detailed strategy to maximize success. Include:\n1. Preparation steps\n2. Key requirements and how to meet them\n3. Timeline with milestones\n4. Risk factors and mitigation\n5. Competitive advantage tactics\n\nFormat in Markdown.`,
      budget: `${base}\nCreate a detailed budget breakdown. Include:\n1. Personnel costs\n2. Infrastructure & tools\n3. Marketing/community\n4. Contingency\n5. Total with justification\n\nFormat as a Markdown table.`,
      milestones: `${base}\nDefine a milestone-based delivery plan:\n- 3-5 major milestones\n- Each with: deliverables, timeline, success metrics, payment trigger\n\nFormat as a Markdown table.`,
      cv: `${base}\nGenerate a tailored CV/resume for this role. Include:\n1. Professional summary (tailored)\n2. Relevant experience highlights\n3. Technical skills (matched to requirements)\n4. Key achievements with metrics\n\nFormat in Markdown.`,
      cover: `${base}\nWrite a compelling cover letter:\n1. Opening hook\n2. Why this role excites me\n3. Relevant experience & achievements\n4. Cultural fit & closing\n\nFormat in Markdown.`,
      prep: `${base}\nPrepare interview content:\n1. 5 likely technical questions with sample answers\n2. 3 behavioral questions with STAR-format answers\n3. 5 smart questions to ask the interviewer\n4. Key topics to review\n\nFormat in Markdown.`,
      application: `${base}\nWrite a standout ambassador application:\n1. Introduction and motivation\n2. Community experience & reach\n3. Content/growth strategy\n4. What I bring to the program\n\nFormat in Markdown.`,
      checklist: `${base}\nCreate a detailed task checklist:\n- All required interactions/tasks\n- Step-by-step instructions for each\n- Estimated time per task\n- Priority order\n\nFormat as a Markdown checklist.`,
      review: `${base}\nPrepare code review submission notes:\n1. Implementation approach\n2. Key design decisions\n3. Security considerations\n4. Testing strategy\n5. Known limitations\n\nFormat in Markdown.`,
    }
    return prompts[mode] || `${base}\nGenerate a professional, detailed response appropriate for this opportunity. Format in Markdown.`
  }

  const startForging = async () => {
    setIsGenerating(true)
    try {
        await api.post('/tracker', { opportunity_id: id, status: 'Applying' }).catch(() => {})
        
        let draftContent = null
        try {
          const resp = await api.post(`/tracker/${id}/draft`)
          draftContent = resp.data.draft
        } catch {
          const resp = await api.post('/chat', {
            message: buildForgePrompt(activeMode),
            opportunity_id: id
          })
          draftContent = resp.data.content
        }
        
        setProposal(draftContent || 'Failed to generate content. Please try again.')
        setChatHistory([{ role: 'ai', content: `Here's your ${currentModeConfig.label.toLowerCase()} draft. Use the chat to refine it, or try the quick actions below.` }])
        toast.success(`${currentModeConfig.label} generated!`)
    } catch (error) {
        toast.error('Failed to generate. Please try again.')
    } finally {
        setIsGenerating(false)
    }
  }

  const switchMode = async (newMode) => {
    setActiveMode(newMode)
    if (proposal) {
      const modeLabel = forgeConfig.modes.find(m => m.key === newMode)?.label || 'Content'
      toast(`Switched to ${modeLabel}. Click "Generate" to create new content.`, { icon: '🔄' })
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
            message: `Refine this ${currentModeConfig.label.toLowerCase()}: "${userMsg}". Current content: ${proposal}. Opportunity: ${opp?.title}`,
            opportunity_id: id
        })
        
        const aiResponse = resp.data.content
        setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
        
        if (aiResponse.includes('FIXED_PROPOSAL:')) {
            const newDraft = aiResponse.split('FIXED_PROPOSAL:')[1]
            setProposal(newDraft.trim())
        }
    } catch (error) {
        toast.error('Failed to refine')
    } finally {
        setIsGenerating(false)
    }
  }

  const { startMissionOnChain } = useOppForge()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal).then(() => toast.success('Copied to clipboard'))
  }

  const exportAsPDF = async () => {
    if (!proposal) return
    const tid = toast.loading('Generating PDF...')
    try {
      // Dynamic import to keep bundle size small
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('forge-preview-content')
      if (!element) { toast.error('Nothing to export', { id: tid }); return }
      
      await html2pdf().set({
        margin: [16, 16, 16, 16],
        filename: `${opp?.title?.slice(0, 40) || 'draft'}-${currentModeConfig.label}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save()
      
      toast.success('PDF downloaded!', { id: tid })
    } catch {
      toast.error('PDF export failed. Try copying instead.', { id: tid })
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const applyToDraft = (content) => {
    setProposal(content)
    setViewMode('preview')
    toast.success('Applied to draft')
  }

  const CategoryIcon = forgeConfig.icon

  const PageContent = () => {
    if (isOppLoading) return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <Sparkles className="mx-auto text-[#ff5500] animate-pulse" size={32} />
          <p className="text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    )

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] -mx-3 -my-4 sm:-mx-5 sm:-my-5 md:-mx-8 md:-my-6 bg-[#0a0806]">
        {/* Workspace Header */}
        <div className="shrink-0 h-14 border-b border-white/5 bg-black/60 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 shrink-0" aria-label="Go back">
              <ArrowLeft size={18} />
            </button>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon size={16} className="shrink-0" style={{ color: forgeConfig.color }} />
              <span className="text-sm font-semibold text-white truncate">
                {opp?.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Chat toggle on mobile */}
            <button 
              onClick={() => setShowChat(!showChat)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-gray-500 relative"
              aria-label="Toggle AI chat"
            >
              <MessageSquare size={18} />
              {chatHistory.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5500] rounded-full" />
              )}
            </button>
            <button 
              onClick={exportAsPDF}
              disabled={!proposal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Export as PDF"
            >
              <Download size={14} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={copyToClipboard}
              disabled={!proposal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <Copy size={14} /> <span className="hidden sm:inline">Copy</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Center: Canvas (Editor + Preview) — takes full width, chat overlays on mobile */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Canvas Toolbar */}
            <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 border-b border-white/5 bg-white/[0.02] gap-2 overflow-x-auto">
              <div className="flex gap-1.5 items-center shrink-0">
                {forgeConfig.modes.map(mode => {
                  const MIcon = mode.icon
                  return (
                    <button 
                      key={mode.key}
                      onClick={() => switchMode(mode.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        activeMode === mode.key ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                      style={activeMode === mode.key ? { 
                        backgroundColor: `${forgeConfig.color}18`, 
                        color: forgeConfig.color 
                      } : {}}
                    >
                      <MIcon size={14} /> {mode.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* View Toggle */}
                <div className="flex items-center bg-white/5 rounded-lg p-0.5">
                  <button 
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button 
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <PenLine size={13} /> Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Content */}
            <div className="flex-1 overflow-y-auto relative">
              {!proposal && !isGenerating && (
                <div className="absolute inset-0 z-10 bg-[#0a0806]/95 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="text-center max-w-lg w-full">
                    <div className="mb-8 relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
                      <CategoryIcon className="w-full h-full" style={{ color: forgeConfig.color, opacity: 0.6 }} />
                      <div className="absolute inset-0 blur-3xl opacity-15" style={{ backgroundColor: forgeConfig.color }} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Create your {forgeConfig.label.toLowerCase()} draft
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{currentModeConfig?.desc}</p>
                    
                    {/* Mode pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {forgeConfig.modes.map(m => {
                        const MI = m.icon
                        return (
                          <button 
                            key={m.key}
                            onClick={() => setActiveMode(m.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                              activeMode === m.key 
                                ? 'text-white border-transparent' 
                                : 'text-gray-500 border-white/10 hover:text-gray-300 hover:bg-white/5'
                            }`}
                            style={activeMode === m.key ? { 
                              backgroundColor: `${forgeConfig.color}20`, 
                              color: forgeConfig.color 
                            } : {}}
                          >
                            <MI size={13} /> {m.label}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button 
                      onClick={startForging}
                      className="btn btn-primary px-8 py-3.5 text-sm font-semibold rounded-xl group"
                    >
                      <Sparkles size={16} /> Generate {currentModeConfig?.label}
                    </button>
                  </div>
                </div>
              )}

              {isGenerating && !proposal && (
                <div className="absolute inset-0 z-10 bg-[#0a0806]/95 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Sparkles className="mx-auto animate-spin" size={28} style={{ color: forgeConfig.color }} />
                    <p className="text-sm text-gray-400">Generating your {currentModeConfig?.label.toLowerCase()}...</p>
                    <p className="text-xs text-gray-600">This may take a few seconds</p>
                  </div>
                </div>
              )}

              {/* Edit or Preview Mode */}
              {viewMode === 'edit' ? (
                <div className="h-full p-4 sm:p-6 lg:p-10">
                  <textarea 
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="w-full h-full bg-transparent text-gray-300 text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-700"
                    placeholder={`Your ${currentModeConfig?.label || 'draft'} will appear here...`}
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-6 lg:p-10">
                  {proposal ? (
                    <div id="forge-preview-content" className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                      prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3 prose-h1:mb-4
                      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-sm
                      prose-li:text-gray-300 prose-li:text-sm
                      prose-strong:text-white prose-strong:font-semibold
                      prose-code:text-[#ff5500] prose-code:bg-[#ff5500]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                      prose-a:text-[#ff5500] prose-a:no-underline hover:prose-a:underline
                      prose-table:text-sm
                      prose-th:text-[#ff5500] prose-th:text-xs prose-th:font-semibold prose-th:border-b prose-th:border-[#ff5500]/20 prose-th:pb-2
                      prose-td:text-gray-300 prose-td:border-b prose-td:border-white/5 prose-td:py-2
                      prose-blockquote:border-l-[#ff5500] prose-blockquote:bg-[#ff5500]/5 prose-blockquote:py-1 prose-blockquote:rounded-r
                      prose-hr:border-white/10
                    ">
                      <ReactMarkdown>{proposal}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-700 text-sm">
                      Your {currentModeConfig?.label || 'draft'} will appear here...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="shrink-0 px-3 sm:px-5 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center gap-2.5 overflow-x-auto">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap shrink-0">Quick:</span>
              {(forgeConfig.quickActions || []).map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setChatMessage(action)
                    setShowChat(true)
                    setTimeout(() => chatInputRef.current?.focus(), 100)
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap shrink-0"
                >
                  {action}
                </button>
              ))}
              {proposal && (
                <button 
                  onClick={startForging}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all"
                  style={{ borderColor: `${forgeConfig.color}40`, color: forgeConfig.color, backgroundColor: `${forgeConfig.color}10` }}
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: AI Chat — slides in on mobile, fixed on desktop */}
          {showChat && (
            <>
              {/* Mobile backdrop */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/60 z-30" 
                onClick={() => setShowChat(false)} 
              />
              <div className="absolute lg:relative right-0 top-0 bottom-0 z-40 w-[85vw] sm:w-96 lg:w-[400px] border-l border-white/5 bg-[#0d0a08] flex flex-col">
                {/* Chat Header */}
                <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#ff5500]" />
                    <span className="text-sm font-semibold text-white">AI Assistant</span>
                  </div>
                  <button 
                    onClick={() => setShowChat(false)} 
                    className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Opportunity Context */}
                <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-xs text-gray-500 mb-1.5">Context</p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {opp?.ai_summary || opp?.description || 'No description available'}
                  </p>
                  {opp?.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opp.required_skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-gray-500 border border-white/5">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="py-12 text-center">
                      <Wand2 className="mx-auto text-gray-800 mb-3" size={28} />
                      <p className="text-sm text-gray-600 mb-1">No messages yet</p>
                      <p className="text-xs text-gray-700">Generate a draft first, then refine it here</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`rounded-xl p-3 text-sm leading-relaxed ${
                        msg.role === 'ai' ? 'bg-white/[0.03] border border-white/5 text-gray-300' : 
                        msg.role === 'system' ? 'bg-blue-500/5 border border-blue-500/10 text-blue-300 text-xs' :
                        'bg-[#ff5500]/5 border border-[#ff5500]/10 text-gray-300 ml-6'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold ${
                            msg.role === 'ai' ? 'text-[#ff5500]' : msg.role === 'system' ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            {msg.role === 'ai' ? 'Forge AI' : msg.role === 'system' ? 'Tip' : 'You'}
                          </span>
                          {msg.role === 'ai' && msg.content.length > 100 && (
                            <button 
                              onClick={() => applyToDraft(msg.content)}
                              className="flex items-center gap-1 text-[10px] font-medium text-[#ff5500]/60 hover:text-[#ff5500] transition-colors"
                            >
                              <Replace size={10} /> Apply to Draft
                            </button>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap text-[13px]">{msg.content}</div>
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                      Thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="shrink-0 p-3 bg-black/40 border-t border-white/5">
                  <form onSubmit={handleRefinement} className="relative">
                    <input 
                      ref={chatInputRef}
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask AI to refine your draft..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-[#ff5500]/50 focus:ring-1 focus:ring-[#ff5500]/20 transition-all placeholder-gray-600"
                    />
                    <button 
                      type="submit" 
                      disabled={isGenerating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#ff5500] transition-colors disabled:opacity-30"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <FeatureGate featureName="AI Workspace" requirePremium={true}>
      <PageContent />
    </FeatureGate>
  )
}
