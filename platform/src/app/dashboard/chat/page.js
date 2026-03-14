'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Upload, FileText, X, ChevronDown, Zap, BookOpen, Target, DollarSign, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import FeatureGate from '@/components/ui/FeatureGate'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/components/providers/AuthProvider'

const fetcher = url => api.get(url).then(res => res.data)

const PROPOSAL_TEMPLATES = [
  {
    id: 'yc',
    name: 'Y Combinator Application',
    icon: Target,
    color: 'var(--accent-primary)',
    description: '10-question format, concise answers',
    prompt: 'Generate a Y Combinator-style application for this opportunity. Use the 10-question format: What will you build? Why now? Team? Growth trajectory? Use my CV and skills to craft compelling, concise answers (max 120 words per question).'
  },
  {
    id: 'grant',
    name: 'Standard Grant Proposal',
    icon: DollarSign,
    color: 'var(--status-success)',
    description: 'Executive summary, goals, budget, timeline',
    prompt: 'Draft a professional grant proposal with: Executive Summary (150 words), Project Goals & Objectives, Technical Approach, Team Qualifications (use my CV), Budget Breakdown, Timeline with Milestones, and Impact Statement. Match my skills to requirements.'
  },
  {
    id: 'pitch-deck',
    name: 'Pitch Deck Outline',
    icon: Briefcase,
    color: 'var(--accent-secondary)',
    description: 'Sequoia Capital 10-slide formula',
    prompt: 'Create a Sequoia Capital-style pitch deck outline (10 slides): 1) Problem, 2) Solution, 3) Why Now, 4) Market Size, 5) Competition, 6) Product, 7) Business Model, 8) Team (highlight my background from CV), 9) Traction, 10) Ask. Be specific and data-driven.'
  },
  {
    id: 'hackathon',
    name: 'Hackathon Submission',
    icon: Zap,
    color: 'var(--status-info)',
    description: 'Inspiration, What it does, Tech stack, Challenges',
    prompt: 'Write a winning hackathon submission with these sections: Inspiration (why this problem matters), What it does (clear value prop), How we built it (tech stack matching my skills from CV), Challenges we ran into, Accomplishments, What we learned, What is next. Make it exciting and authentic.'
  },
  {
    id: 'custom',
    name: 'Custom Proposal',
    icon: BookOpen,
    color: 'var(--text-tertiary)',
    description: 'Tell me what you need',
    prompt: ''
  }
]

export default function UnifiedWorkspace() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [uploading, setUploading] = useState(false)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  const { data: uploads, mutate: mutateUploads } = useSWR('/workspace/uploads', fetcher, { fallbackData: [] })
  const { data: chatHistory, mutate: mutateHistory } = useSWR('/workspace/history', fetcher, { fallbackData: [] })

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory.map(m => ({ 
        id: m.id, 
        role: m.role, 
        content: m.content 
      })))
    } else {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `**Welcome to your AI Workspace, ${user?.full_name || 'Builder'}!** 🚀

I'm your personal AI assistant. I can:
- **Draft proposals** using industry-standard templates
- **Analyze opportunities** and match them to your skills
- **Review your CV** and suggest improvements
- **Generate pitch decks, grants, hackathon submissions**

${uploads && uploads.length > 0 ? `\n✅ I have access to your uploaded documents (${uploads.length} file${uploads.length > 1 ? 's' : ''})` : '\n📄 Upload your CV or portfolio to get personalized assistance'}

What would you like to work on?`
      }])
    }
  }, [chatHistory, user, uploads])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Check daily upload limit
    const today = new Date().toDateString()
    const todayUploads = (uploads || []).filter(u => new Date(u.uploaded_at).toDateString() === today)
    
    if (todayUploads.length >= 3) {
      toast.error('Daily upload limit reached (3 files per day)')
      return
    }

    if (todayUploads.length + files.length > 3) {
      toast.error(`You can only upload ${3 - todayUploads.length} more file(s) today`)
      return
    }

    setUploading(true)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        await api.post('/workspace/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(`${file.name} uploaded successfully`)
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    mutateUploads()
    setUploading(false)
    fileInputRef.current.value = ''
  }

  const removeFile = async (fileId) => {
    try {
      await api.delete(`/workspace/uploads/${fileId}`)
      mutateUploads()
      toast.success('File removed')
    } catch {
      toast.error('Failed to remove file')
    }
  }

  const applyTemplate = (template) => {
    if (template.id === 'custom') {
      setInput('')
      setShowTemplates(false)
      return
    }
    setInput(template.prompt)
    setShowTemplates(false)
    toast.success(`${template.name} template loaded`)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    const messageText = input
    setInput('')
    setIsTyping(true)

    try {
      const { data } = await api.post('/workspace/chat', {
        message: messageText,
        context: {
          uploaded_files: (uploads || []).map(u => u.filename),
          user_skills: user?.skills || [],
          user_level: user?.level || 1
        }
      })

      const aiMsg = { 
        id: Date.now().toString() + '_ai', 
        role: 'assistant', 
        content: data.content 
      }
      setMessages(prev => [...prev, aiMsg])
      mutateHistory()
    } catch (err) {
      toast.error('AI response failed. Try again.')
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setIsTyping(false)
    }
  }

  const todayUploadCount = (uploads || []).filter(u => 
    new Date(u.uploaded_at).toDateString() === new Date().toDateString()
  ).length

  return (
    <FeatureGate featureName="AI Workspace">
      <div className="h-full flex flex-col bg-[var(--bg-canvas)]">
        
        {/* Workspace Header */}
        <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-primary)] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">AI Workspace</h1>
                <p className="text-xs text-[var(--text-tertiary)]">Your personal AI assistant & proposal studio</p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="text-xs text-[var(--text-tertiary)]">Uploads today: <span className="font-semibold text-[var(--text-primary)]">{todayUploadCount}/3</span></p>
                {uploads && uploads.length > 0 && (
                  <p className="text-[10px] text-[var(--status-success)]">✓ {uploads.length} file{uploads.length > 1 ? 's' : ''} active</p>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={todayUploadCount >= 3 || uploading}
                className="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload CV/Files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded Files Pills */}
          {uploads && uploads.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {uploads.map(file => (
                <div key={file.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-full text-xs group">
                  <FileText size={12} className="text-[var(--accent-primary)]" />
                  <span className="text-[var(--text-secondary)]">{file.filename}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--status-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]'
                    : 'bg-[var(--bg-tertiary)] border border-[var(--border-default)]'
                }`}>
                  {msg.role === 'assistant' ? 
                    <Sparkles size={16} className="text-white" /> : 
                    <User size={16} className="text-[var(--text-secondary)]" />
                  }
                </div>

                <div className={`max-w-[80%] ${
                  msg.role === 'assistant'
                    ? 'bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl rounded-tl-sm p-5'
                    : 'bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/20 rounded-2xl rounded-tr-sm p-4'
                }`}>
                  <div className={`prose prose-sm max-w-none ${
                    msg.role === 'assistant' 
                      ? 'prose-invert prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--accent-primary)] prose-pre:bg-[var(--bg-tertiary)] prose-ul:text-[var(--text-secondary)]' 
                      : 'prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)]'
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl rounded-tl-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-primary)] px-6 py-4 shrink-0">
          {/* Templates Dropdown */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-24 left-6 right-6 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden z-50 max-w-3xl mx-auto"
              >
                <div className="p-4 border-b border-[var(--border-default)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Proposal Templates</h3>
                    <button onClick={() => setShowTemplates(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Industry-standard formats used by top founders & teams</p>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {PROPOSAL_TEMPLATES.map(template => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="text-left p-4 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-lg transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${template.color}15`, color: template.color }}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{template.name}</h4>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{template.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-overlay)] transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-primary)] shrink-0"
              title="Use proposal template"
            >
              <BookOpen size={20} />
            </button>

            <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl focus-within:border-[var(--accent-primary)] transition-colors overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder="Ask me anything, or click Templates for structured proposals..."
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none max-h-32 overflow-y-auto"
                style={{ fieldSizing: 'content' }}
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,85,0,0.2)] hover:shadow-[0_0_30px_rgba(255,85,0,0.3)] shrink-0"
            >
              <Send size={20} />
            </button>
          </form>

          <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[9px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[9px]">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </FeatureGate>
  )
}
