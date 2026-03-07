'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Sparkles, Send, ArrowLeft, Wand2, FileText, MessageSquare, Lightbulb, FileEdit, Presentation, Target, Briefcase, Trophy, Code, Rocket, Users, Shield, BookOpen, Eye, PenLine, Copy, Replace, Download, X, RefreshCw, Plus, ChevronDown, ChevronRight, Brain, BarChart2, Calendar, DollarSign, Search, ExternalLink, Star, Clock, TrendingUp, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useOppForge } from '@/hooks/useOppForge'
import ReactMarkdown from 'react-markdown'

const fetcher = url => api.get(url).then(res => res.data)

import FeatureGate from '@/components/ui/FeatureGate'

// Brainstorm chips shown when chat has no user messages yet
const BRAINSTORM_CHIPS = [
  { label: 'What makes a winner here?', icon: Trophy },
  { label: 'Suggest 3 unique angles', icon: Lightbulb },
  { label: 'What are my risks?', icon: Shield },
  { label: 'How competitive is this?', icon: BarChart2 },
  { label: 'What should I prioritize?', icon: Target },
  { label: 'Ideal team composition?', icon: Users },
]

// Parse markdown into interactive sections
function parseSectionsFromMarkdown(content) {
  if (!content?.trim()) return []
  const lines = content.split('\n')
  const sections = []
  let current = null
  for (const line of lines) {
    if (/^#{1,2}\s/.test(line)) {
      if (current) sections.push(current)
      current = { id: Math.random().toString(36).slice(2), title: line.replace(/^#+\s/, ''), content: '', isCollapsed: false }
    } else if (current) {
      current.content += line + '\n'
    } else if (line.trim()) {
      current = { id: Math.random().toString(36).slice(2), title: 'Introduction', content: line + '\n', isCollapsed: false }
    }
  }
  if (current) sections.push(current)
  if (!sections.length && content.trim()) return [{ id: 'default', title: 'Draft', content, isCollapsed: false }]
  return sections.map(s => ({ ...s, content: s.content.trimEnd() }))
}

function sectionsToMarkdown(sections) {
  return sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')
}

const RESEARCH_MODE = { key: 'research', label: 'Research', icon: Search, desc: 'Deep competitive analysis & intelligence' }

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
      RESEARCH_MODE,
    ],
    quickActions: ['Generate 5 winning ideas', 'Add technical architecture', 'Strengthen demo plan', 'Optimize for judges', 'Add team composition'],
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
      RESEARCH_MODE,
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
      RESEARCH_MODE,
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
      RESEARCH_MODE,
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
      RESEARCH_MODE,
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
      RESEARCH_MODE,
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
      RESEARCH_MODE,
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
    RESEARCH_MODE,
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
  const [sections, setSections] = useState([])
  const [sectionGenId, setSectionGenId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [activeMode, setActiveMode] = useState(null)
  const [viewMode, setViewMode] = useState('sections')
  const [showChat, setShowChat] = useState(false)
  const [autoBriefDone, setAutoBriefDone] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  
  const { data: opp, isLoading: isOppLoading } = useSWR(`/opportunities/${id}`, fetcher)
  const { data: trackerData } = useSWR('/tracker', fetcher)
  
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

  // Auto-brief: fire once when opportunity data arrives
  useEffect(() => {
    if (!opp || autoBriefDone) return
    setAutoBriefDone(true)
    ;(async () => {
      try {
        const apps = Array.isArray(trackerData) ? trackerData : (trackerData?.applications || [])
        const history = apps.slice(0, 5).map(a =>
          `${a.title || a.opportunity?.title || 'Unknown'} (${a.status || 'tracked'})`
        ).join(', ')
        const resp = await api.post('/chat', {
          message: `You are a strategic advisor. Give a concise 3-point intelligence brief:

1. **What they want** — top 2 things the organizers care about most
2. **Competition level** — difficulty (Easy/Medium/Hard) and why
3. **#1 tip to stand out** — the most important differentiator

Opportunity: ${opp.title}
Category: ${opp.category}
Reward: ${opp.reward_pool || 'Not stated'}
Description: ${(opp.ai_summary || opp.description || '').slice(0, 500)}
${opp.win_probability ? `Win rate: ${Math.round(opp.win_probability * 100)}%` : ''}
${history ? `User history: ${history}` : ''}

Be direct. 4-6 sentences max. No fluff.`,
          opportunity_id: id
        })
        setChatHistory([{ role: 'ai', content: resp.data.content, tag: 'brief' }])
      } catch { /* silent */ }
    })()
  }, [opp]) // eslint-disable-line

  const buildUserHistorySnippet = useCallback(() => {
    const apps = Array.isArray(trackerData) ? trackerData : (trackerData?.applications || [])
    if (!apps.length) return ''
    return apps.slice(0, 6).map(a => `${a.title || a.opportunity?.title || 'Unknown'} (${a.status || 'tracked'})`).join(', ')
  }, [trackerData])

  const currentModeConfig = forgeConfig.modes.find(m => m.key === activeMode) || forgeConfig.modes[0]

  const buildForgePrompt = useCallback((mode) => {
    const skills = (opp?.required_skills || []).join(', ')
    const tags = (opp?.tags || []).join(', ')
    const reqs = (opp?.requirements || []).slice(0, 8).join('\n- ')
    const deadline = opp?.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'
    const userHistory = buildUserHistorySnippet()
    const base = `=== OPPORTUNITY INTELLIGENCE ===\nTitle: ${opp?.title}\nCategory: ${opp?.category}\nDescription: ${opp?.ai_summary || opp?.description}\nReward / Prize Pool: ${opp?.reward_pool || opp?.reward || 'Not specified'}\nDeadline: ${deadline}\nChain / Platform: ${opp?.chain || opp?.source || 'Web3'}\nRequired Skills: ${skills || 'See description'}\nTags: ${tags || 'N/A'}\nTrust Score: ${opp?.trust_score ?? 'N/A'}/10\nAI Win Probability: ${opp?.win_probability ? Math.round(opp.win_probability * 100) + '%' : 'N/A'}\n${reqs ? 'Specific Requirements:\\n- ' + reqs : ''}\n${opp?.strategy ? 'Strategy hint: ' + opp.strategy : ''}\n${userHistory ? '\\n=== USER CONTEXT ===\\nPreviously tracked: ' + userHistory : ''}\n=================================\n`
    
    const prompts = {
      ideas: `${base}\nGenerate 5 creative, high-probability winning project ideas for this hackathon.\nFor each idea:\n1. **Project Name** — punchy\n2. **One-line pitch** — what it does + why novel\n3. **Technical stack** — key technologies (2-3 sentences)\n4. **Why it could win** — maps to judge priorities\n5. **Difficulty** — Easy/Medium/Hard + reasoning\n\nFormat in Markdown. Match required skills and reward criteria.`,
      proposal: `${base}\nWrite a compelling, personalized application/proposal.\n\n## Hook\nStrong opening that signals deep understanding of ${opp?.title || 'this opportunity'}\n\n## Why This Opportunity\nGenuine specific motivation referencing the actual mission and reward\n\n## What I Bring\nSkills mapped to requirements (${skills || 'as listed'})\n\n## My Approach\nConcrete plan with deliverables; reference deadline (${deadline})\n\n## Timeline & Milestones\n3-4 milestones to the deadline\n\n## Closing Statement\nConfident specific CTA\n\nFormat in Markdown. Personal tone, not templated.`,
      pitch: `${base}\nCreate a pitch deck (8-10 slides): Title & Hook | Problem | Solution | How It Works | Traction | Market (${opp?.chain || 'Web3'}) | Team | Roadmap to ${deadline} | The Ask\nFor each slide: title + 4-5 bullets + speaker notes.\nFormat in Markdown.`,
      strategy: `${base}\nBuild a winning strategy.\n\n## Opportunity Assessment\nDifficulty, expected competition, success probability\n\n## Preparation Checklist\nStep-by-step prep with estimated hours\n\n## Requirements Mapping\nEach requirement vs. how to meet/exceed it\n\n## Competitive Differentiators\n3 ways to stand out from typical applicants\n\n## Timeline to ${deadline}\nWeek-by-week milestones\n\n## Risk Register\nRisks + mitigation plans\n\n## Pre-Submission Checklist\n20-point final review\n\nFormat in Markdown.`,
      research: `${base}\nDeep intelligence report.\n\n## Opportunity DNA\nWhat organizers really value; past winner patterns; hidden criteria\n\n## Competition Intelligence\nEstimated applicants; difficulty 1-10 with reasoning; main competitors\n\n## Success Patterns\nTop 3 winner factors; common mistakes; insider knowledge\n\n## Unique Angle Generator\n5 differentiated approaches most applicants won't think of — with rationale\n\n## Risk & Reward Analysis\nHonest ROI: time cost vs. expected value\n\n## Personalized Action Plan\nNext steps tailored to: ${buildUserHistorySnippet() || 'building Web3 portfolio'}\nPriority ordered.\n\nFormat in Markdown with detailed, actionable intel.`,
      budget: `${base}\nDetailed budget targeting ${opp?.reward_pool || 'stated reward'}.\n\n## Budget Table\n| Category | Item | Cost (USD) | Justification |\nInclude: Personnel, Infrastructure, Tools, Marketing, Legal, Contingency 10%\n\n## Budget Narrative\n1-2 sentences per major item\n\n## Contingency Plan\nWhat gets cut if partial funding\n\nFormat in Markdown.`,
      milestones: `${base}\nMilestone plan for deadline ${deadline}.\n| Milestone | Deliverables | Timeline | Success Metric | Payment Trigger |\nCreate 4-6 milestones.\n\n## Dependencies & Risks\n\n## Definition of Done\n\nFormat in Markdown.`,
      cv: `${base}\nHighly tailored CV.\n\n## Professional Summary\n3-4 lines tailored to ${opp?.title || 'this role'}\n\n## Core Competencies\nSkills matrix mapped to: ${skills}\n\n## Relevant Experience\n2-3 roles with 4-5 quantified achievement bullets each\n\n## Key Projects\n2-3 projects with outcomes\n\n## Education & Certifications\n\nFormat in Markdown.`,
      cover: `${base}\nExceptional cover letter.\n\n## Opening Hook\nPersonal, specific — NOT "I am writing to apply for..."\n\n## The Match\nWhy this opportunity + why this applicant; cite specific requirements\n\n## Proof Points\n2-3 concrete achievements relevant to what they need\n\n## Cultural Fit\nConnection to ${opp?.chain || 'Web3'} and the mission\n\n## Close\nConfident, action-oriented CTA\n\nFormat in Markdown. Conversational but professional.`,
      prep: `${base}\nComprehensive interview kit.\n\n## Technical Questions (5)\nLikely questions + detailed model answers\n\n## Behavioral Questions (3)\nSTAR-format answers tailored to this role\n\n## Smart Questions to Ask (7)\nQuestions signaling deep research\n\n## Key Topics to Review\nSpecific concepts and technologies\n\n## Red Flags to Avoid\n\nFormat in Markdown.`,
      application: `${base}\nStandout ambassador application.\n\n## Personal Brand\nBrief statement + community credentials\n\n## Why ${opp?.title || 'This Program'}\nSpecific genuine reason showing real research\n\n## Community Strategy\nChannels, target audience, content plan, growth tactics\n\n## Proof of Impact\nPast work, growth numbers, content examples\n\n## 30-60-90 Day Plan\nConcrete milestones for first 3 months\n\nFormat in Markdown.`,
      checklist: `${base}\nComplete step-by-step task checklist.\nFor every required interaction:\n- [ ] **Task** — exact numbered steps, time estimate, priority High/Med/Low\n- Gas fee estimates if on-chain\n- How to verify completion; common pitfalls\n\nEnd with a Progress Tracker table.\nFormat as Markdown checklist.`,
      review: `${base}\nCode review submission notes.\n\n## Implementation Overview\n## Key Design Decisions\n## Security Considerations\n## Testing Strategy\n## Performance Notes\n## Known Limitations\n## Reviewer Guide\n\nFormat in Markdown.`,
    }
    return prompts[mode] || `${base}\nGenerate a professional, personalized response for this opportunity. Format in Markdown.`
  }, [opp, buildUserHistorySnippet])

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
        
        const content = draftContent || '# Draft\n\nFailed to generate. Please try again.'
        setProposal(content)
        const parsed = parseSectionsFromMarkdown(content)
        setSections(parsed)
        setViewMode('sections')
        setChatHistory(prev => [
          ...prev,
          { role: 'ai', content: `✅ Your **${currentModeConfig.label}** is ready — ${parsed.length} section${parsed.length !== 1 ? 's' : ''} generated.\n\nClick any section to edit directly, or ask me to refine specific parts.` }
        ])
        toast.success(`${currentModeConfig.label} generated!`)
    } catch (error) {
        toast.error('Failed to generate. Please try again.')
    } finally {
        setIsGenerating(false)
    }
  }

  const regenerateSection = async (section) => {
    setSectionGenId(section.id)
    try {
      const resp = await api.post('/chat', {
        message: `Rewrite ONLY the "${section.title}" section. Make it stronger and better tailored.\n\nCurrent content:\n${section.content}\n\nOpportunity: ${opp?.title} | Reward: ${opp?.reward_pool || 'N/A'}\n\nReturn ONLY the new content — no heading, no commentary.`,
        opportunity_id: id
      })
      const newContent = resp.data.content
      setSections(prev => {
        const updated = prev.map(s => s.id === section.id ? { ...s, content: newContent } : s)
        setProposal(sectionsToMarkdown(updated))
        return updated
      })
      toast.success(`"${section.title}" refreshed`)
    } catch {
      toast.error('Regeneration failed')
    } finally {
      setSectionGenId(null)
    }
  }

  const updateSection = (sId, newContent) => {
    setSections(prev => {
      const updated = prev.map(s => s.id === sId ? { ...s, content: newContent } : s)
      setProposal(sectionsToMarkdown(updated))
      return updated
    })
  }

  const updateSectionTitle = (sId, newTitle) => {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, title: newTitle } : s))
  }

  const toggleSection = (sId) => {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, isCollapsed: !s.isCollapsed } : s))
  }

  const deleteSection = (sId) => {
    setSections(prev => {
      const updated = prev.filter(s => s.id !== sId)
      setProposal(sectionsToMarkdown(updated))
      return updated
    })
    toast.success('Section removed')
  }

  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2), title: 'New Section', content: 'Add your content here...', isCollapsed: false }
    ])
  }

  const switchMode = async (newMode) => {
    setActiveMode(newMode)
    if (proposal) {
      const modeLabel = forgeConfig.modes.find(m => m.key === newMode)?.label || 'Content'
      toast(`Switched to ${modeLabel}. Click "Regenerate" to refresh.`, { icon: '🔄' })
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
            message: `User request: "${userMsg}"\n\nContext: Working on ${currentModeConfig.label} for "${opp?.title}"\nCurrent draft: ${proposal?.slice(0, 700) || 'Not generated yet'}\nReward: ${opp?.reward_pool || 'N/A'}\n\nIf updating the draft, prefix with UPDATED_DRAFT:\nOtherwise answer directly. Be specific to this opportunity.`,
            opportunity_id: id
        })
        
        const aiResponse = resp.data.content
        setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
        
        if (aiResponse.includes('UPDATED_DRAFT:')) {
            const newDraft = aiResponse.split('UPDATED_DRAFT:')[1].trim()
            setProposal(newDraft)
            setSections(parseSectionsFromMarkdown(newDraft))
            toast.success('Draft updated')
        }
    } catch (error) {
        toast.error('Failed to refine')
    } finally {
        setIsGenerating(false)
    }
  }

  const sendBrainstormChip = (text) => {
    setChatHistory(prev => [...prev, { role: 'user', content: text }])
    setIsGenerating(true)
    api.post('/chat', {
      message: `${text}\n\nOpportunity: "${opp?.title}" (${opp?.category}, reward: ${opp?.reward_pool || 'N/A'})\n${(opp?.ai_summary || opp?.description || '').slice(0, 400)}\n\nBe specific to this exact opportunity. Direct and actionable.`,
      opportunity_id: id
    }).then(resp => {
      setChatHistory(prev => [...prev, { role: 'ai', content: resp.data.content }])
    }).catch(() => toast.error('Failed to respond'))
      .finally(() => setIsGenerating(false))
  }

  const { startMissionOnChain } = useOppForge()

  const copyToClipboard = () => {
    const text = viewMode === 'sections' && sections.length ? sectionsToMarkdown(sections) : proposal
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'))
  }

  const exportAsPDF = async () => {
    if (!proposal && !sections.length) return
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

  const applyToDraft = (content) => {
    setProposal(content)
    setSections(parseSectionsFromMarkdown(content))
    setViewMode('sections')
    toast.success('Applied to draft')
  }

  const daysLeft = opp?.deadline
    ? Math.max(0, Math.ceil((new Date(opp.deadline) - new Date()) / 86400000))
    : null

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

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
              <span className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                {opp?.title}
              </span>
              {opp?.reward_pool && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-green-400 shrink-0">
                  <DollarSign size={9} />{opp.reward_pool}
                </span>
              )}
              {daysLeft !== null && (
                <span className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] shrink-0 ${daysLeft <= 7 ? 'text-red-400' : 'text-gray-400'}`}>
                  <Clock size={9} />{daysLeft}d left
                </span>
              )}
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
                  {sections.length > 0 && (
                    <button 
                      onClick={() => setViewMode('sections')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        viewMode === 'sections' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Brain size={12} /> <span className="hidden sm:inline">Sections</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Eye size={13} /> <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <PenLine size={13} /> <span className="hidden sm:inline">Edit</span>
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
                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{currentModeConfig?.desc}</p>
                    
                    {/* Opportunity stats */}
                    {opp && (
                      <div className="flex flex-wrap justify-center gap-2 mb-5">
                        {opp.reward_pool && (
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                            <DollarSign size={11} />{opp.reward_pool}
                          </span>
                        )}
                        {daysLeft !== null && (
                          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${daysLeft <= 7 ? 'text-red-400 bg-red-500/5 border-red-500/20' : 'text-gray-400 bg-white/5 border-white/10'}`}>
                            <Calendar size={11} />{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                          </span>
                        )}
                        {opp.win_probability && (
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/20 text-xs text-[#ff5500]">
                            <TrendingUp size={11} />{Math.round(opp.win_probability * 100)}% win rate
                          </span>
                        )}
                      </div>
                    )}
                    
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

              {/* Sections View (interactive) */}
              {viewMode === 'sections' && sections.length > 0 && (
                <div className="p-4 sm:p-6 space-y-2.5 max-w-4xl mx-auto">
                  {sections.map((section) => (
                    <div key={section.id} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02] group">
                      {/* Section header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 bg-white/[0.015] cursor-pointer hover:bg-white/[0.04] transition-colors"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {section.isCollapsed
                            ? <ChevronRight size={13} className="text-gray-600 shrink-0" />
                            : <ChevronDown size={13} className="text-gray-600 shrink-0" />}
                          <input
                            value={section.title}
                            onChange={e => { e.stopPropagation(); updateSectionTitle(section.id, e.target.value) }}
                            onClick={e => e.stopPropagation()}
                            className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:text-[#ff5500] min-w-0 w-full"
                          />
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={e => { e.stopPropagation(); regenerateSection(section) }}
                            disabled={sectionGenId === section.id}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-600 hover:text-[#ff5500] transition-colors disabled:opacity-40"
                            title="Regenerate this section with AI"
                          >
                            {sectionGenId === section.id
                              ? <Sparkles size={12} className="animate-spin text-[#ff5500]" />
                              : <RefreshCw size={12} />}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteSection(section.id) }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                            title="Delete section"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      {/* Section body */}
                      {!section.isCollapsed && (
                        <div className="px-4 pt-1 pb-4">
                          <textarea
                            value={section.content}
                            onChange={e => updateSection(section.id, e.target.value)}
                            className="w-full bg-transparent text-gray-300 text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-700"
                            style={{ minHeight: '60px', height: Math.max(60, section.content.split('\n').length * 21 + 24) + 'px' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSection}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-xs text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all"
                  >
                    <Plus size={13} /> Add Section
                  </button>
                </div>
              )}

              {/* Edit or Preview Mode */}
              {viewMode === 'edit' ? (
                <div className="h-full p-4 sm:p-6 lg:p-10">
                  <textarea 
                    value={proposal}
                    onChange={(e) => {
                      setProposal(e.target.value)
                      setSections(parseSectionsFromMarkdown(e.target.value))
                    }}
                    className="w-full h-full bg-transparent text-gray-300 text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-700 font-mono"
                    placeholder={`Your ${currentModeConfig?.label || 'draft'} will appear here in Markdown...`}
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
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap shrink-0">Ask AI:</span>
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
                    <Brain size={15} className="text-[#ff5500]" />
                    <span className="text-sm font-semibold text-white">Forge Intelligence</span>
                  </div>
                  <button 
                    onClick={() => setShowChat(false)} 
                    className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Opportunity Context Card */}
                <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-white/[0.015]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{opp?.title}</p>
                    {opp?.url && (
                      <a href={opp.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1 hover:bg-white/10 rounded text-gray-600 hover:text-gray-300 transition-colors">
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {opp?.category && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                        style={{ backgroundColor: `${forgeConfig.color}12`, color: forgeConfig.color, borderColor: `${forgeConfig.color}25` }}>
                        {opp.category}
                      </span>
                    )}
                    {opp?.reward_pool && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] text-green-400 bg-green-500/10 border border-green-500/20">
                        <DollarSign size={8} />{opp.reward_pool}
                      </span>
                    )}
                    {daysLeft !== null && (
                      <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] border ${daysLeft <= 7 ? 'text-red-400 bg-red-500/5 border-red-500/20' : 'text-gray-500 bg-white/4 border-white/8'}`}>
                        <Clock size={8} />{daysLeft}d
                      </span>
                    )}
                    {opp?.trust_score && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] text-gray-500 bg-white/4 border border-white/8">
                        <Star size={8} />{opp.trust_score}/10
                      </span>
                    )}
                    {opp?.win_probability && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] text-[#ff5500] bg-[#ff5500]/8 border border-[#ff5500]/18">
                        <TrendingUp size={8} />{Math.round(opp.win_probability * 100)}%
                      </span>
                    )}
                    {opp?.is_verified && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] text-blue-400 bg-blue-500/8 border border-blue-500/18">
                        <CheckCircle size={8} />Verified
                      </span>
                    )}
                  </div>
                  {opp?.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {opp.required_skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[9px] text-gray-600 border border-white/[0.05]">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="py-12 text-center">
                      <Wand2 className="mx-auto text-gray-800 mb-3" size={28} />
                      <p className="text-sm text-gray-600 mb-1">Analysing opportunity...</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`rounded-xl p-3 text-sm leading-relaxed ${
                        msg.role === 'ai'
                          ? msg.tag === 'brief'
                            ? 'bg-[#ff5500]/[0.05] border border-[#ff5500]/15 text-gray-300'
                            : 'bg-white/[0.03] border border-white/5 text-gray-300'
                          : msg.role === 'system' ? 'bg-blue-500/5 border border-blue-500/10 text-blue-300 text-xs' :
                          'bg-[#ff5500]/5 border border-[#ff5500]/10 text-gray-300 ml-6'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold ${
                            msg.role === 'ai'
                              ? msg.tag === 'brief' ? 'text-[#ff5500]' : 'text-gray-500'
                              : msg.role === 'system' ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            {msg.role === 'ai'
                              ? msg.tag === 'brief' ? '⚡ Intelligence Brief' : 'Forge AI'
                              : msg.role === 'system' ? 'Tip' : 'You'}
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

                {/* Brainstorm chips — shown when no user messages yet */}
                {chatHistory.filter(m => m.role === 'user').length === 0 && !isGenerating && (
                  <div className="shrink-0 px-3 py-2.5 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 mb-2 font-medium uppercase tracking-wide">Brainstorm</p>
                    <div className="flex flex-wrap gap-1.5">
                      {BRAINSTORM_CHIPS.map(({ label, icon: Icon }) => (
                        <button
                          key={label}
                          onClick={() => sendBrainstormChip(label)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[11px] text-gray-500 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all"
                        >
                          <Icon size={9} className="shrink-0" style={{ color: forgeConfig.color }} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="shrink-0 p-3 bg-black/40 border-t border-white/5">
                  <form onSubmit={handleRefinement} className="relative">
                    <input 
                      ref={chatInputRef}
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask anything about this opportunity..."
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
