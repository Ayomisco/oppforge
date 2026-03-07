'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Trash2, Edit3, Check, X, Plus, MessageSquare, Clock, ChevronLeft, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import useSWR, { mutate as globalMutate } from 'swr'
import toast from 'react-hot-toast'
import FeatureGate from '@/components/ui/FeatureGate'

const fetcher = url => api.get(url).then(res => res.data)

export default function ChatPage() {
  // Session state
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false) // Hidden by default on mobile
  
  // Message state
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const scrollRef = useRef(null)

  // Responsive: show sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(true)
      else setShowSidebar(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch sessions list
  const { data: sessions, mutate: mutateSessions } = useSWR('/chat/sessions', fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })

  // Fetch messages when session changes
  const { data: sessionMessages, mutate: mutateMessages } = useSWR(
    activeSessionId ? `/chat/sessions/${activeSessionId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Legacy: fetch all history when no session selected
  const { data: history } = useSWR(
    !activeSessionId ? '/chat/history' : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (activeSessionId && sessionMessages) {
      setMessages(sessionMessages.map(m => ({
        id: m.id,
        role: m.sender === 'user' ? 'user' : 'ai',
        content: m.content
      })))
    } else if (!activeSessionId && history) {
      setMessages(history.map(m => ({
        id: m.id,
        role: m.sender === 'user' ? 'user' : 'ai',
        content: m.content
      })))
    }
  }, [activeSessionId, sessionMessages, history])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const startNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setInput('')
    // Close sidebar on mobile after action
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
      
      if (!activeSessionId && data.session_id) {
        setActiveSessionId(data.session_id)
      }

      const aiMsg = { id: Date.now().toString() + '_ai', role: 'ai', content: data.content }
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMsg, id: userMsg.id },
        aiMsg,
      ])

      mutateSessions()
      if (data.session_id) {
        globalMutate(`/chat/sessions/${data.session_id}`)
      }
    } catch (error) {
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
    } catch (error) {
       toast.error('Deletion failed')
    }
  }

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      mutateSessions()
      if (activeSessionId === sessionId) {
        startNewChat()
      }
      toast.success('Session deleted')
    } catch (error) {
      toast.error('Failed to delete session')
    }
  }

  const startEdit = (msg) => {
    setEditingId(msg.id)
    setEditValue(msg.content)
  }

  const saveEdit = async (id) => {
    try {
      await api.patch(`/chat/${id}`, { content: editValue })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editValue } : m))
      setEditingId(null)
      toast.success('Message updated')
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const formatSessionTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return d.toLocaleDateString()
  }

  return (
    <FeatureGate featureName="Forge AI Assistant">
      <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex glass-card border-[var(--glass-border)] overflow-hidden relative">
        
        {/* Sessions Sidebar — Responsive Overlay on Mobile */}
        <AnimatePresence>
        {showSidebar && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (window.innerWidth < 768) setShowSidebar(false) }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute md:relative z-50 md:z-auto w-72 md:w-72 border-r border-[var(--glass-border)] bg-[#080604] flex flex-col overflow-hidden flex-shrink-0 h-full"
            >
              {/* Sidebar Header */}
              <div className="p-3 border-b border-[var(--glass-border)]">
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-[#ff5500]/10 border border-[#ff5500]/30 rounded-lg text-[#ff5500] text-sm font-semibold hover:bg-[#ff5500]/20 transition-all"
                >
                  <Plus size={16} /> New Chat
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto">
                {(!sessions || sessions.length === 0) ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {sessions.map(session => (
                      <button
                        key={session.session_id}
                        onClick={() => selectSession(session.session_id)}
                        className={`w-full text-left p-3 rounded-lg group transition-all relative ${
                          activeSessionId === session.session_id
                            ? 'bg-[#ff5500]/10 border border-[#ff5500]/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                            activeSessionId === session.session_id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {session.title}
                          </p>
                          <button
                            onClick={(e) => deleteSession(session.session_id, e)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-gray-600 transition-all flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock size={12} className="text-gray-600" />
                          <span className="text-[11px] text-gray-600">{formatSessionTime(session.updated_at)}</span>
                          <span className="text-[11px] text-gray-700">{session.message_count} msgs</span>
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-[var(--glass-border)] bg-[var(--bg-espresso)]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2.5 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                aria-label="Toggle sessions"
              >
                {showSidebar ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-forge)]/20 flex items-center justify-center text-[var(--accent-forge)] border border-[var(--accent-forge)]/30 shadow-[0_0_15px_rgba(255,85,0,0.15)]">
                <Bot size={22} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Forge AI</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            </div>
            <button className="hidden md:flex btn btn-secondary text-sm py-2" onClick={startNewChat}>New Chat</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 scroll-smooth">
            {messages.length === 0 && !isTyping && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
                    <Sparkles size={48} className="text-[var(--accent-forge)] mb-4" />
                    <h3 className="text-white font-bold text-lg">How can I help?</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">Ask about opportunities, get application advice, or draft proposals.</p>
                </div>
            )}

            <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 flex items-center justify-center border transition-all ${
                  msg.role === 'ai' 
                    ? 'bg-[var(--bg-walnut)] border-[var(--accent-forge)]/30 text-[var(--accent-forge)]' 
                    : 'bg-[var(--bg-walnut)] border-white/10 text-white'
                }`}>
                  {msg.role === 'ai' ? <Sparkles size={16} /> : <User size={16} />}
                </div>

                <div className={`relative max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-xl text-sm leading-relaxed transition-all ${
                  msg.role === 'ai'
                    ? 'bg-[var(--bg-walnut)] border border-[var(--glass-border)] text-gray-300'
                    : 'bg-[var(--accent-forge)]/10 border border-[var(--accent-forge)]/30 text-white'
                }`}>
                  {editingId === msg.id ? (
                    <div className="space-y-3">
                      <textarea 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#ff5500]"
                        rows={Math.max(2, editValue.split('\n').length)}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-2 hover:text-gray-400 rounded-lg"><X size={16} /></button>
                        <button onClick={() => saveEdit(msg.id)} className="p-2 text-[#ff5500] hover:text-[#ffaa00] rounded-lg"><Check size={16} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'user' && (
                        <div className="absolute top-1 -left-10 sm:-left-12 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button onClick={() => startEdit(msg)} className="p-1.5 bg-[#1a1512] border border-white/5 rounded-lg hover:border-[#ff5500] hover:text-[#ff5500] transition-all">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(msg.id)} className="p-1.5 bg-[#1a1512] border border-white/5 rounded-lg hover:border-red-500 hover:text-red-500 transition-all">
                            <Trash2 size={14} />
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
                 <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--bg-walnut)] border border-[var(--accent-forge)]/30 flex items-center justify-center text-[var(--accent-forge)]">
                   <Sparkles size={16} />
                 </div>
                 <div className="flex items-center gap-1.5 h-8 px-3">
                   <span className="w-2 h-2 bg-[#ff5500] rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <span className="w-2 h-2 bg-[#ff7700] rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <span className="w-2 h-2 bg-[#ff9900] rounded-full animate-bounce" />
                 </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-[var(--bg-espresso)] border-t border-[var(--glass-border)]">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Forge AI anything..."
                className="w-full bg-[#0a0806] text-white text-sm px-4 py-3.5 pr-14 rounded-xl border border-[#1a1512] focus:outline-none focus:border-[#ff5500] focus:shadow-[0_0_20px_rgba(255,85,0,0.1)] transition-all placeholder-gray-600"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-[#ff5500] hover:bg-[#ff5500] hover:text-black rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-2 text-[11px] text-center text-gray-600">
              Forge AI · Powered by advanced language models
            </div>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}
