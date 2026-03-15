'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Trash2, Edit3, Check, X, Plus, MessageSquare, Clock, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import useSWR, { mutate as globalMutate } from 'swr'
import toast from 'react-hot-toast'
import FeatureGate from '@/components/ui/FeatureGate'

const fetcher = url => api.get(url).then(res => res.data)

/* ── Animated sidebar toggle icon ── */
const SidebarToggle = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transition-transform duration-200" style={{ transform: open ? 'scaleX(-1)' : 'scaleX(1)' }}>
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="7" y1="1" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 7l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { data: sessions, mutate: mutateSessions } = useSWR('/chat/sessions', fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })

  const { data: sessionMessages, mutate: mutateMessages } = useSWR(
    activeSessionId ? `/chat/sessions/${activeSessionId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const { data: history } = useSWR(
    !activeSessionId ? '/chat/history' : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (activeSessionId && sessionMessages) {
      setMessages(sessionMessages.map(m => ({ id: m.id, role: m.sender === 'user' ? 'user' : 'ai', content: m.content })))
    } else if (!activeSessionId && history) {
      setMessages(history.map(m => ({ id: m.id, role: m.sender === 'user' ? 'user' : 'ai', content: m.content })))
    }
  }, [activeSessionId, sessionMessages, history])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const startNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setInput('')
    if (window.innerWidth < 768) setShowSidebar(false)
  }

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId)
    if (window.innerWidth < 768) setShowSidebar(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const tempId = Date.now().toString()
    const userMsg = { id: tempId, role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    const messageText = input
    setInput('')
    setIsTyping(true)

    try {
      const { data } = await api.post('/chat', {
        message: messageText,
        session_id: activeSessionId || undefined,
      })
      if (!activeSessionId && data.session_id) setActiveSessionId(data.session_id)

      const aiMsg = { id: Date.now().toString() + '_ai', role: 'ai', content: data.content }
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMsg, id: userMsg.id },
        aiMsg,
      ])
      mutateSessions()
      if (data.session_id) globalMutate(`/chat/sessions/${data.session_id}`)
    } catch {
      toast.error('Forge AI failed to respond')
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsTyping(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/chat/${id}`)
      setMessages(prev => prev.filter(m => m.id !== id))
      toast.success('Message deleted')
    } catch { toast.error('Deletion failed') }
  }

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      mutateSessions()
      if (activeSessionId === sessionId) startNewChat()
      toast.success('Session deleted')
    } catch { toast.error('Failed to delete session') }
  }

  const startEdit = (msg) => { setEditingId(msg.id); setEditValue(msg.content) }
  const saveEdit = async (id) => {
    try {
      await api.patch(`/chat/${id}`, { content: editValue })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editValue } : m))
      setEditingId(null)
      toast.success('Updated')
    } catch { toast.error('Update failed') }
  }

  const formatSessionTime = (dateStr) => {
    const d = new Date(dateStr)
    const diff = Date.now() - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return d.toLocaleDateString()
  }

  return (
    <FeatureGate featureName="Forge AI Assistant">
      {/* Full height container — fills parent (which is flex-1 overflow-hidden from layout) */}
      <div className="h-full flex bg-[var(--bg-canvas)] overflow-hidden">

        {/* ── Sessions Sidebar ── */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Mobile backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { if (window.innerWidth < 768) setShowSidebar(false) }}
                className="md:hidden fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute md:relative z-50 md:z-auto w-72 md:w-72 border-r border-[var(--border-default)] bg-[var(--bg-primary)] flex flex-col overflow-hidden shrink-0 h-full"
              >
                {/* New Chat */}
                <div className="p-3 border-b border-[var(--border-default)]">
                  <button
                    onClick={startNewChat}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/30 rounded-md text-[var(--accent-primary)] text-sm font-medium hover:bg-[var(--accent-primary)]/20 transition-all"
                  >
                    <Plus size={16} /> New Chat
                  </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto">
                  {(!sessions || sessions.length === 0) ? (
                    <div className="p-6 text-center text-[var(--text-tertiary)]">
                      <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-0.5">
                      {sessions.map(session => (
                        <button
                          key={session.session_id}
                          onClick={() => selectSession(session.session_id)}
                          className={`w-full text-left p-3 rounded-md group transition-all ${
                            activeSessionId === session.session_id
                              ? 'bg-[var(--bg-tertiary)] border border-[var(--border-default)]'
                              : 'hover:bg-[var(--bg-secondary)] border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug line-clamp-2 ${
                              activeSessionId === session.session_id ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                            }`}>
                              {session.title}
                            </p>
                            <button
                              onClick={(e) => deleteSession(session.session_id, e)}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:text-[var(--status-danger)] text-[var(--text-tertiary)] transition-all shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Clock size={11} className="text-[var(--text-tertiary)]" />
                            <span className="text-[11px] text-[var(--text-tertiary)]">{formatSessionTime(session.updated_at)}</span>
                            <span className="text-[11px] text-[var(--text-tertiary)]">· {session.message_count} msgs</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-primary)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] transition-colors"
                aria-label="Toggle sessions"
              >
                <SidebarToggle open={showSidebar} />
              </button>
              <div className="w-8 h-8 rounded-md bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                <Bot size={18} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--text-primary)]">Forge AI</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
                  <span className="text-[11px] text-[var(--status-success)]">Online</span>
                </div>
              </div>
            </div>
            <button className="hidden md:flex btn btn-secondary text-xs py-1.5 px-3" onClick={startNewChat}>
              <Plus size={14} /> New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary-muted)] flex items-center justify-center text-[var(--accent-primary)] mb-4">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-[var(--text-primary)] font-semibold text-lg">How can I help?</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm">Ask about opportunities, get application advice, or draft proposals.</p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}
                >
                  <div className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center border ${
                    msg.role === 'ai'
                      ? 'bg-[var(--accent-primary-muted)] border-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] text-[var(--text-secondary)]'
                  }`}>
                    {msg.role === 'ai' ? <Sparkles size={14} /> : <User size={14} />}
                  </div>

                  <div className={`relative max-w-[85%] sm:max-w-[75%] p-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)]'
                      : 'bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/20 text-[var(--text-primary)]'
                  }`}>
                    {editingId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md p-2 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                          rows={Math.max(2, editValue.split('\n').length)}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="p-1.5 hover:text-[var(--text-primary)] text-[var(--text-tertiary)] rounded-md"><X size={14} /></button>
                          <button onClick={() => saveEdit(msg.id)} className="p-1.5 text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] rounded-md"><Check size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.role === 'user' && (
                          <div className="absolute top-1 -left-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            <button onClick={() => startEdit(msg)} className="p-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] text-[var(--text-tertiary)] transition-all">
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleDelete(msg.id)} className="p-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md hover:border-[var(--status-danger)] hover:text-[var(--status-danger)] text-[var(--text-tertiary)] transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--accent-primary-muted)] border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
                  <Sparkles size={14} />
                </div>
                <div className="flex items-center gap-1.5 h-8 px-3">
                  <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.15s] opacity-70" />
                  <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce opacity-40" />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-default)] shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Forge AI anything..."
                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm px-4 py-3 pr-12 rounded-lg border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/20 transition-all placeholder-[var(--text-placeholder)]"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white rounded-md transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="mt-2 text-[11px] text-center text-[var(--text-tertiary)]">
              Forge AI · Powered by advanced language models
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}
