'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Sparkles, Send, ArrowLeft, FileEdit, Presentation, Target,
  Briefcase, Trophy, Code, Rocket, Users, Shield, BookOpen,
  Eye, PenLine, Copy, Download, X, RefreshCw, Plus,
  ChevronDown, ChevronRight, Brain, DollarSign, Search,
  Clock, TrendingUp, MessageSquare, FileText, ChevronUp, Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useOppForge } from '@/hooks/useOppForge'
import ReactMarkdown from 'react-markdown'
import FeatureGate from '@/components/ui/FeatureGate'

const fetcher = url => api.get(url).then(res => res.data)

// ─── Markdown Helpers ─────────────────────────────────

function parseSectionsFromMarkdown(content) {
  if (!content) return []
  const lines = content.split('\n')
  const sections = []
  let current = null
  for (const line of lines) {
    const match = line.match(/^#{1,2}\s+(.+)/)
    if (match) {
      if (current) sections.push(current)
      current = { id: Math.random().toString(36).slice(2), title: match[1], content: '', isCollapsed: false }
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line
    } else {
      current = { id: Math.random().toString(36).slice(2), title: 'Introduction', content: line, isCollapsed: false }
    }
  }
  if (current) sections.push(current)
  return sections.map(s => ({ ...s, content: s.content.trim() }))
}

function sectionsToMarkdown(sections) {
  return sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')
}

// ─── Mode Configs ─────────────────────────────────────

const RESEARCH_MODE = { key: 'research', label: 'Research', icon: Search, desc: 'Deep intelligence & analysis' }

const FORGE_MODES = {
  hackathon: {
    label: 'Hackathon', icon: Trophy, color: '#ff5500', defaultMode: 'proposal',
    modes: [
      { key: 'ideas', label: 'Ideas', icon: Sparkles, desc: 'Brainstorm winning concepts' },
      { key: 'proposal', label: 'Proposal', icon: FileEdit, desc: 'Write your submission' },
      { key: 'pitch', label: 'Pitch', icon: Presentation, desc: 'Craft your pitch deck' },
      { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Plan your approach' },
      RESEARCH_MODE,
    ],
    quickActions: ['Strengthen the hook', 'Add technical depth', 'Insert milestone table', 'Sharpen competitive edge', 'Make it more specific'],
  },
  grants: {
    label: 'Grant', icon: DollarSign, color: '#10b981', defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Proposal', icon: FileEdit, desc: 'Draft a winning proposal' },
      { key: 'budget', label: 'Budget', icon: DollarSign, desc: 'Detailed budget breakdown' },
      { key: 'milestones', label: 'Milestones', icon: Target, desc: 'Milestone plan' },
      { key: 'pitch', label: 'Pitch', icon: Presentation, desc: 'Elevator pitch' },
      RESEARCH_MODE,
    ],
    quickActions: ['Quantify impact', 'Strengthen budget justification', 'Add milestone metrics', 'Align with funder goals', 'Sharpen executive summary'],
  },
  bounties: {
    label: 'Bounty', icon: Code, color: '#8b5cf6', defaultMode: 'proposal',
    modes: [
      { key: 'proposal', label: 'Solution', icon: FileEdit, desc: 'Draft your solution' },
      { key: 'strategy', label: 'Approach', icon: Target, desc: 'Technical approach' },
      { key: 'review', label: 'Review', icon: Eye, desc: 'Submission review notes' },
      RESEARCH_MODE,
    ],
    quickActions: ['Add code architecture', 'Explain design decisions', 'Add test strategy', 'Security considerations', 'Optimize for review'],
  },
  airdrops: {
    label: 'Airdrop', icon: Rocket, color: '#3b82f6', defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Qualification steps' },
      { key: 'checklist', label: 'Checklist', icon: Shield, desc: 'Required interactions' },
      RESEARCH_MODE,
    ],
    quickActions: ['List all requirements', 'Estimate gas costs', 'Add timeline', 'Optimize interactions', 'Risk assessment'],
  },
  testnets: {
    label: 'Testnet', icon: Rocket, color: '#f59e0b', defaultMode: 'strategy',
    modes: [
      { key: 'strategy', label: 'Guide', icon: BookOpen, desc: 'Participation guide' },
      { key: 'checklist', label: 'Checklist', icon: Shield, desc: 'Tasks to complete' },
      RESEARCH_MODE,
    ],
    quickActions: ['List all tasks', 'Add wallet setup steps', 'Estimate time needed', 'Prioritize interactions', 'Track progress'],
  },
  ambassador: {
    label: 'Ambassador', icon: Users, color: '#ec4899', defaultMode: 'application',
    modes: [
      { key: 'application', label: 'Application', icon: FileEdit, desc: 'Ambassador application' },
      { key: 'strategy', label: 'Content Plan', icon: Target, desc: 'Community strategy' },
      { key: 'pitch', label: 'Pitch', icon: Presentation, desc: 'Showcase your presence' },
      RESEARCH_MODE,
    ],
    quickActions: ['Highlight community experience', 'Add content calendar', 'Show social reach', 'Detail growth plan', 'Add past results'],
  },
  jobs: {
    label: 'Job / Role', icon: Briefcase, color: '#06b6d4', defaultMode: 'cv',
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
  label: 'Opportunity', icon: Sparkles, color: '#ff5500', defaultMode: 'proposal',
  modes: [
    { key: 'proposal', label: 'Proposal', icon: FileEdit, desc: 'Draft a compelling application' },
    { key: 'strategy', label: 'Strategy', icon: Target, desc: 'Build a tactical approach' },
    { key: 'pitch', label: 'Pitch', icon: Presentation, desc: 'Create a pitch outline' },
    RESEARCH_MODE,
  ],
  quickActions: ['Quantify achievements', 'Add milestone table', 'Strengthen roadmap', 'Add technical detail', 'Refine summary'],
}

function getForgeConfig(category) {
  if (!category) return DEFAULT_CONFIG
  const cat = category.toLowerCase().replace(/s$/, '')
  for (const [key, config] of Object.entries(FORGE_MODES)) {
    if (cat.includes(key.replace(/s$/, '')) || key.replace(/s$/, '').includes(cat)) return config
  }
  return DEFAULT_CONFIG
}

// ═══════════════════════════════════════════════════════
// Workspace Component
// ═══════════════════════════════════════════════════════

export default function ForgeWorkspace({ params }) {
  const { id } = React.use(params)
  const router = useRouter()

  // State
  const [proposal, setProposal] = useState('')
  const [sections, setSections] = useState([])
  const [sectionGenId, setSectionGenId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [activeMode, setActiveMode] = useState(null)
  const [viewMode, setViewMode] = useState('sections')
  const [showThread, setShowThread] = useState(false)
  const [autoBriefDone, setAutoBriefDone] = useState(false)
  const [briefExpanded, setBriefExpanded] = useState(true)
  const inputRef = useRef(null)
  const canvasEndRef = useRef(null)

  // Data
  const { data: opp, isLoading: isOppLoading } = useSWR(`/opportunities/${id}`, fetcher)
  const { data: trackerData } = useSWR('/tracker', fetcher)
  const { startMissionOnChain } = useOppForge()

  const forgeConfig = useMemo(() => getForgeConfig(opp?.category), [opp?.category])
  const CategoryIcon = forgeConfig.icon
  const daysLeft = opp?.deadline
    ? Math.max(0, Math.ceil((new Date(opp.deadline) - new Date()) / 86400000))
    : null

  // Set default mode
  useEffect(() => {
    if (forgeConfig && !activeMode) setActiveMode(forgeConfig.defaultMode)
  }, [forgeConfig, activeMode])

  // Auto-brief on load
  useEffect(() => {
    if (!opp || autoBriefDone) return
    setAutoBriefDone(true)
    ;(async () => {
      try {
        const apps = Array.isArray(trackerData) ? trackerData : (trackerData?.applications || [])
        const history = apps.slice(0, 5).map(a =>
          `${a.title || a.opportunity?.title || 'Unknown'} (${a.status || 'tracked'})`
        ).join(', ')
        const resp = await api.post('/workspace/chat', {
          message: `You are a strategic advisor. Give a concise 3-point intelligence brief:\n\n1. **What they want** — top 2 things the organizers care about most\n2. **Competition level** — difficulty (Easy/Medium/Hard) and why\n3. **#1 tip to stand out** — the most important differentiator\n\nOpportunity: ${opp.title}\nCategory: ${opp.category}\nReward: ${opp.reward_pool || 'Not stated'}\nDescription: ${(opp.ai_summary || opp.description || '').slice(0, 500)}\n${opp.win_probability ? `Win rate: ${Math.round(opp.win_probability * 100)}%` : ''}\n${history ? `User history: ${history}` : ''}\n\nBe direct. 4-6 sentences max. No fluff.`,
          context: { opportunity_id: id }
        })
        setChatHistory([{ role: 'ai', content: resp.data.content, tag: 'brief' }])
      } catch { /* silent */ }
    })()
  }, [opp]) // eslint-disable-line

  // Scroll thread into view
  useEffect(() => {
    if (showThread) canvasEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, showThread])

  // ─── Prompt Building ───────────────────────────────

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

  // ─── Handlers ──────────────────────────────────────

  const startForging = async (overrideMode) => {
    const mode = overrideMode || activeMode
    if (overrideMode) setActiveMode(overrideMode)
    setIsGenerating(true)
    try {
      await api.post('/tracker', { opportunity_id: id, status: 'Applying' }).catch(() => {})
      let draftContent = null
      try {
        const resp = await api.post(`/tracker/${id}/draft`)
        draftContent = resp.data.draft
      } catch {
        const resp = await api.post('/workspace/chat', {
          message: buildForgePrompt(mode),
          context: { opportunity_id: id }
        })
        draftContent = resp.data.content
      }
      const content = draftContent || '# Draft\n\nFailed to generate. Please try again.'
      setProposal(content)
      const parsed = parseSectionsFromMarkdown(content)
      setSections(parsed)
      setViewMode('sections')
      const modeLabel = forgeConfig.modes.find(m => m.key === mode)?.label || 'Content'
      setChatHistory(prev => [
        ...prev,
        { role: 'ai', content: `✅ Your **${modeLabel}** is ready — ${parsed.length} section${parsed.length !== 1 ? 's' : ''} generated. Edit any section directly, or ask me to refine.` }
      ])
      toast.success(`${modeLabel} generated!`)
    } catch {
      toast.error('Failed to generate. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateSection = async (section) => {
    setSectionGenId(section.id)
    try {
      const resp = await api.post('/workspace/chat', {
        message: `Rewrite ONLY the "${section.title}" section. Make it stronger and better tailored.\n\nCurrent content:\n${section.content}\n\nOpportunity: ${opp?.title} | Reward: ${opp?.reward_pool || 'N/A'}\n\nReturn ONLY the new content — no heading, no commentary.`,
        context: { opportunity_id: id }
      })
      setSections(prev => {
        const updated = prev.map(s => s.id === section.id ? { ...s, content: resp.data.content } : s)
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

  const handleRefinement = async (e) => {
    e?.preventDefault()
    if (!chatMessage.trim()) return
    const userMsg = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setShowThread(true)
    setIsGenerating(true)
    try {
      const resp = await api.post('/workspace/chat', {
        message: `User request: "${userMsg}"\n\nContext: Working on ${currentModeConfig.label} for "${opp?.title}"\nCurrent draft: ${proposal?.slice(0, 700) || 'Not generated yet'}\nReward: ${opp?.reward_pool || 'N/A'}\n\nIf updating the draft, prefix with UPDATED_DRAFT:\nOtherwise answer directly. Be specific to this opportunity.`,
        context: { opportunity_id: id }
      })
      const aiResponse = resp.data.content
      setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }])
      if (aiResponse.includes('UPDATED_DRAFT:')) {
        const newDraft = aiResponse.split('UPDATED_DRAFT:')[1].trim()
        setProposal(newDraft)
        setSections(parseSectionsFromMarkdown(newDraft))
        toast.success('Draft updated')
      }
    } catch {
      toast.error('Failed to refine')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCommand = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) {
      if (!proposal) startForging()
      return
    }
    if (!proposal) {
      // No content yet — generate from free-form prompt
      const userMsg = chatMessage
      setChatMessage('')
      setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
      setShowThread(true)
      setIsGenerating(true)
      try {
        const resp = await api.post('/workspace/chat', {
          message: `Generate professional content for "${opp?.title}" (${opp?.category}).\n\nUser instruction: "${userMsg}"\n\nOpportunity:\n- Reward: ${opp?.reward_pool || 'N/A'}\n- Description: ${(opp?.ai_summary || opp?.description || '').slice(0, 500)}\n- Skills: ${(opp?.required_skills || []).join(', ')}\n- Deadline: ${opp?.deadline || 'Ongoing'}\n\nGenerate a complete, well-structured response in Markdown with clear section headers (## heading). Be specific and actionable.`,
          opportunity_id: id
        })
        const content = resp.data.content || '# Draft\n\nFailed to generate.'
        setProposal(content)
        const parsed = parseSectionsFromMarkdown(content)
        setSections(parsed)
        setViewMode('sections')
        setChatHistory(prev => [...prev, { role: 'ai', content: `✅ Generated ${parsed.length} sections. Edit directly or ask me to refine.` }])
        toast.success('Draft generated!')
      } catch {
        toast.error('Generation failed. Try again.')
      } finally {
        setIsGenerating(false)
      }
      return
    }
    handleRefinement(e)
  }

  const applyToDraft = (content) => {
    setProposal(content)
    setSections(parseSectionsFromMarkdown(content))
    setViewMode('sections')
    toast.success('Applied to draft')
  }

  const copyToClipboard = () => {
    const text = viewMode === 'sections' && sections.length ? sectionsToMarkdown(sections) : proposal
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'))
  }

  const exportAsPDF = async () => {
    if (!proposal && !sections.length) return
    const tid = toast.loading('Generating PDF...')
    try {
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

  // Derived data
  const briefMessage = chatHistory.find(m => m.tag === 'brief')
  const threadMessages = chatHistory.filter(m => m.tag !== 'brief')

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  if (isOppLoading) {
    return (
      <FeatureGate featureName="AI Workspace" requirePremium={true}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <Sparkles className="mx-auto text-[#ff5500] animate-pulse" size={32} />
            <p className="text-sm text-gray-500">Loading workspace...</p>
          </div>
        </div>
      </FeatureGate>
    )
  }

  return (
    <FeatureGate featureName="AI Workspace" requirePremium={true}>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] -mx-3 -my-4 sm:-mx-5 sm:-my-5 md:-mx-8 md:-my-6 bg-[#0a0806]">

        {/* ═══ Header ═══ */}
        <div className="shrink-0 h-14 border-b border-white/5 bg-black/60 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 shrink-0" aria-label="Go back">
              <ArrowLeft size={18} />
            </button>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon size={16} className="shrink-0" style={{ color: forgeConfig.color }} />
              <span className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{opp?.title}</span>
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
            {/* View toggle — visible when content exists */}
            {proposal && (
              <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-0.5">
                {sections.length > 0 && (
                  <button onClick={() => setViewMode('sections')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'sections' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Brain size={12} /> Sections
                  </button>
                )}
                <button onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Eye size={12} /> Preview
                </button>
                <button onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  <PenLine size={12} /> Edit
                </button>
              </div>
            )}
            <button onClick={copyToClipboard} disabled={!proposal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none">
              <Copy size={14} /><span className="hidden sm:inline">Copy</span>
            </button>
            <button onClick={exportAsPDF} disabled={!proposal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none">
              <Download size={14} /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* ═══ Canvas (scrollable) ═══ */}
        <div className="flex-1 overflow-y-auto">

          {/* Intelligence Brief Card */}
          {briefMessage && (
            <div className="max-w-4xl mx-auto px-3 sm:px-6 mt-4">
              <button
                onClick={() => setBriefExpanded(!briefExpanded)}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-[#ff5500]/[0.06] border border-[#ff5500]/15 hover:bg-[#ff5500]/[0.08] transition-colors ${briefExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={13} className="text-[#ff5500]" />
                  <span className="text-xs font-semibold text-[#ff5500]">Intelligence Brief</span>
                </div>
                {briefExpanded ? <ChevronUp size={14} className="text-[#ff5500]/60" /> : <ChevronDown size={14} className="text-[#ff5500]/60" />}
              </button>
              {briefExpanded && (
                <div className="px-4 py-3 bg-[#ff5500]/[0.03] border border-t-0 border-[#ff5500]/10 rounded-b-xl">
                  <div className="text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">{briefMessage.content}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Empty State ── */}
          {!proposal && !isGenerating && (
            <div className="flex items-center justify-center min-h-[55vh] p-6">
              <div className="text-center max-w-2xl w-full">
                <div className="mb-6 relative mx-auto w-16 h-16">
                  <CategoryIcon className="w-full h-full" style={{ color: forgeConfig.color, opacity: 0.5 }} />
                  <div className="absolute inset-0 blur-3xl opacity-15" style={{ backgroundColor: forgeConfig.color }} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                  Forge your {forgeConfig.label.toLowerCase()} submission
                </h2>
                <p className="text-sm text-gray-500 mb-6">Pick a mode below, or describe what you need in the command bar</p>

                {/* Opportunity badges */}
                {opp && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {opp.reward_pool && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                        <DollarSign size={11} />{opp.reward_pool}
                      </span>
                    )}
                    {daysLeft !== null && (
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${daysLeft <= 7 ? 'text-red-400 bg-red-500/5 border-red-500/20' : 'text-gray-400 bg-white/5 border-white/10'}`}>
                        <Clock size={11} />{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                      </span>
                    )}
                    {opp.win_probability && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/20 text-xs text-[#ff5500]">
                        <TrendingUp size={11} />{Math.round(opp.win_probability * 100)}% win rate
                      </span>
                    )}
                  </div>
                )}

                {/* Mode cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-w-xl mx-auto">
                  {forgeConfig.modes.map(m => {
                    const MI = m.icon
                    const isSelected = activeMode === m.key
                    return (
                      <button
                        key={m.key}
                        onClick={() => startForging(m.key)}
                        className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isSelected ? 'border-transparent' : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]'
                        }`}
                        style={isSelected ? { backgroundColor: `${forgeConfig.color}12`, borderColor: `${forgeConfig.color}30` } : {}}
                      >
                        <MI size={22} style={{ color: isSelected ? forgeConfig.color : '#6b7280' }} />
                        <div>
                          <p className={`text-xs font-semibold ${isSelected ? '' : 'text-gray-300 group-hover:text-white'}`}
                            style={isSelected ? { color: forgeConfig.color } : {}}>{m.label}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5 hidden sm:block">{m.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Generating State ── */}
          {isGenerating && !proposal && (
            <div className="flex items-center justify-center min-h-[55vh]">
              <div className="text-center space-y-4">
                <Sparkles className="mx-auto animate-spin" size={28} style={{ color: forgeConfig.color }} />
                <p className="text-sm text-gray-400">Generating your {currentModeConfig?.label.toLowerCase()}...</p>
                <p className="text-xs text-gray-600">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* ── Mobile View Toggle ── */}
          {proposal && (
            <div className="sm:hidden flex items-center justify-center gap-1 py-2 border-b border-white/5 bg-white/[0.02]">
              {sections.length > 0 && (
                <button onClick={() => setViewMode('sections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'sections' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                  Sections
                </button>
              )}
              <button onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                Preview
              </button>
              <button onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                Edit
              </button>
            </div>
          )}

          {/* ── Sections View ── */}
          {proposal && viewMode === 'sections' && sections.length > 0 && (
            <div className="p-4 sm:p-6 space-y-2.5 max-w-4xl mx-auto">
              {sections.map((section) => (
                <div key={section.id} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02] group">
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
                        title="Regenerate section"
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
              <button onClick={addSection}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-xs text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all">
                <Plus size={13} /> Add Section
              </button>
            </div>
          )}

          {/* ── Edit View ── */}
          {proposal && viewMode === 'edit' && (
            <div className="p-4 sm:p-6 lg:p-10 min-h-[50vh]">
              <textarea
                value={proposal}
                onChange={(e) => { setProposal(e.target.value); setSections(parseSectionsFromMarkdown(e.target.value)) }}
                className="w-full min-h-[50vh] bg-transparent text-gray-300 text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-700 font-mono"
                placeholder={`Your ${currentModeConfig?.label || 'draft'} will appear here in Markdown...`}
              />
            </div>
          )}

          {/* ── Preview View ── */}
          {proposal && viewMode === 'preview' && (
            <div className="p-4 sm:p-6 lg:p-10">
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
            </div>
          )}

          {/* ── Inline Chat Thread ── */}
          {threadMessages.length > 0 && (
            <div className="max-w-4xl mx-auto px-3 sm:px-6 my-4">
              <button
                onClick={() => setShowThread(!showThread)}
                className="flex items-center gap-2 mb-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <MessageSquare size={12} />
                {showThread ? 'Hide' : 'Show'} conversation ({threadMessages.length})
                {showThread ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showThread && (
                <div className="space-y-2">
                  {threadMessages.map((msg, i) => (
                    <div key={i} className={`rounded-xl p-3 text-sm leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-white/[0.03] border border-white/5 text-gray-300'
                        : 'bg-[#ff5500]/5 border border-[#ff5500]/10 text-gray-300 ml-8'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">
                          {msg.role === 'ai' ? 'Forge AI' : 'You'}
                        </span>
                        {msg.role === 'ai' && msg.content.length > 100 && proposal && (
                          <button onClick={() => applyToDraft(msg.content)}
                            className="flex items-center gap-1 text-[10px] font-medium text-[#ff5500]/60 hover:text-[#ff5500] transition-colors">
                            Apply to Draft
                          </button>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-[13px]">{msg.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Thinking indicator */}
          {isGenerating && proposal && (
            <div className="max-w-4xl mx-auto px-3 sm:px-6 mb-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
              Thinking...
            </div>
          )}

          <div ref={canvasEndRef} />
        </div>

        {/* ═══ Command Bar ═══ */}
        <div className="shrink-0 border-t border-white/5 bg-black/40 backdrop-blur-md">
          {/* Smart Suggestions */}
          <div className="px-3 sm:px-5 pt-2.5 pb-1.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {proposal ? (
              <>
                {(forgeConfig.quickActions || []).map((action, i) => (
                  <button key={i}
                    onClick={() => {
                      setChatMessage(action)
                      setTimeout(() => inputRef.current?.form?.requestSubmit(), 50)
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap shrink-0">
                    {action}
                  </button>
                ))}
                <button onClick={() => startForging()}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all"
                  style={{ borderColor: `${forgeConfig.color}40`, color: forgeConfig.color, backgroundColor: `${forgeConfig.color}10` }}>
                  <RefreshCw size={12} /> Regenerate
                </button>
              </>
            ) : (
              forgeConfig.modes.map(m => {
                const MI = m.icon
                return (
                  <button key={m.key}
                    onClick={() => startForging(m.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                      activeMode === m.key ? 'text-white border-transparent' : 'text-gray-500 border-white/10 hover:text-gray-300 hover:bg-white/5'
                    }`}
                    style={activeMode === m.key ? { backgroundColor: `${forgeConfig.color}18`, color: forgeConfig.color, borderColor: `${forgeConfig.color}30` } : {}}>
                    <MI size={12} /> {m.label}
                  </button>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="px-3 sm:px-5 pb-3 pt-1">
            <form onSubmit={handleCommand} className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Sparkles size={15} className="text-gray-600" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={proposal ? 'Refine your draft \u2014 "make the intro stronger"' : 'Describe what you need, or pick a mode above...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff5500]/50 focus:ring-1 focus:ring-[#ff5500]/20 transition-all placeholder-gray-600"
              />
              <button type="submit" disabled={isGenerating}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#ff5500] transition-colors disabled:opacity-30">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}
