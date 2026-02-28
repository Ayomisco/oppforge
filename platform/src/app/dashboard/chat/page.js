'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Terminal, Trash2, Edit3, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import FeatureGate from '@/components/ui/FeatureGate'

const fetcher = url => api.get(url).then(res => res.data)

export default function ChatPage() {
  const { data: history, mutate } = useSWR('/chat/history', fetcher)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (history) {
      setMessages(history.map(m => ({
        id: m.id,
        role: m.sender === 'user' ? 'user' : 'ai',
        content: m.content
      })))
    }
  }, [history])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const tempId = Date.now().toString()
    const userMsg = { id: tempId, role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const { data } = await api.post('/chat', { message: input })
      mutate() // Sync with server for real IDs
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
      toast.success('Message incinerated')
    } catch (error) {
       toast.error('Deletion failed')
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
      toast.success('Sequence updated')
    } catch (error) {
      toast.error('Update failed')
    }
  }

  return (
    <FeatureGate featureName="Forge AI Assistant">
      <div className="h-[calc(100vh-8rem)] flex flex-col glass-card border-[var(--glass-border)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--bg-espresso)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[var(--accent-forge)]/20 flex items-center justify-center text-[var(--accent-forge)] border border-[var(--accent-forge)]/30 shadow-[0_0_15px_rgba(255,85,0,0.2)]">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">Forge AI <span className="text-[var(--accent-forge)]">v1.1</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-green-500">REALTIME_CONNECTION_ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
              <button className="btn btn-secondary text-xs py-1.5" onClick={() => setMessages([])}>Clear Session</button>
              <button className="btn btn-secondary text-xs py-1.5">Alpha Protocols</button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
          {messages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Terminal size={48} className="text-[var(--accent-forge)] mb-4" />
                  <h3 className="text-white font-bold uppercase tracking-widest">Awaiting Command...</h3>
                  <p className="text-[10px] font-mono mt-2">Forge AI is primed for technical analysis and mission strategy.</p>
              </div>
          )}

          <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg.id || idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}
            >
              <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border transition-all ${
                msg.role === 'ai' 
                  ? 'bg-[var(--bg-walnut)] border-[var(--accent-forge)]/30 text-[var(--accent-forge)] shadow-[0_0_10px_rgba(255,85,0,0.1)]' 
                  : 'bg-[var(--bg-mahogany)] border-white/10 text-white'
              }`}>
                {msg.role === 'ai' ? <Terminal size={14} /> : <User size={14} />}
              </div>

              <div className={`relative max-w-[80%] p-4 rounded-lg font-mono text-sm leading-relaxed transition-all ${
                msg.role === 'ai'
                  ? 'bg-[var(--bg-walnut)] border border-[var(--glass-border)] text-gray-300'
                  : 'bg-[var(--accent-forge)]/10 border border-[var(--accent-forge)]/30 text-white shadow-[0_0_15px_rgba(255,85,0,0.05)]'
              }`}>
                {editingId === msg.id ? (
                  <div className="space-y-3">
                    <textarea 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs focus:outline-none focus:border-[#ff5500]"
                      rows={Math.max(2, editValue.split('\n').length)}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="p-1 hover:text-gray-400"><X size={14} /></button>
                      <button onClick={() => saveEdit(msg.id)} className="p-1 text-[#ff5500] hover:text-[#ffaa00]"><Check size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.content}
                    {msg.role === 'user' && (
                      <div className="absolute top-0 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <button onClick={() => startEdit(msg)} className="p-1.5 bg-[#1a1512] border border-white/5 rounded hover:border-[#ff5500] hover:text-[#ff5500] transition-all">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => handleDelete(msg.id)} className="p-1.5 bg-[#1a1512] border border-white/5 rounded hover:border-red-500 hover:text-red-500 transition-all">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-8 h-8 rounded bg-[var(--bg-walnut)] border border-[var(--accent-forge)]/30 flex items-center justify-center text-[var(--accent-forge)] shadow-[0_0_10px_rgba(255,85,0,0.1)]">
                 <Terminal size={14} />
               </div>
               <div className="flex items-center gap-1.5 h-8 px-2">
                 <span className="w-1.5 h-1.5 bg-[#ff5500] rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="w-1.5 h-1.5 bg-[#ff7700] rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="w-1.5 h-1.5 bg-[#ff9900] rounded-full animate-bounce" />
               </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--bg-espresso)] border-t border-[var(--glass-border)]">
          <form onSubmit={handleSend} className="relative group/form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="INITIALIZE_COMMAND_SEQUENCE..."
              className="w-full bg-[#0a0806] text-white font-mono text-sm px-4 py-3 pr-12 rounded border border-[#1a1512] focus:outline-none focus:border-[#ff5500] focus:shadow-[0_0_20px_rgba(255,85,0,0.15)] transition-all placeholder-gray-800"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#ff5500] hover:bg-[#ff5500] hover:text-black rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-center text-gray-600 font-mono tracking-tighter uppercase flex items-center justify-center gap-4">
            <span>Forge AI v1.1</span>
            <span className="w-1 h-1 bg-gray-800 rounded-full" />
            <span>AES-256 Protocol</span>
            <span className="w-1 h-1 bg-gray-800 rounded-full" />
            <span className="text-[#ffaa00]">Quantized Llama-3.3 Core</span>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}
