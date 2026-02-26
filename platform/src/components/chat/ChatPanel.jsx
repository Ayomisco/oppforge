'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, Lock, Crown } from 'lucide-react'
import api from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'

const SUGGESTED_PROMPTS = [
  "Draft a proposal for this hackathon",
  "Is this grant worth my time?",
  "Analyze the requirements",
  "Summarize the judging criteria"
]

export default function ChatPanel() {
  const { user, isGuest } = useAuth()
  const router = useRouter()
  const params = useParams()
  const opportunity_id = params?.id

  // Check if user has active subscription
  const hasActiveSubscription = user?.subscription_status === 'active' || 
                                 user?.subscription_status === 'trialing' ||
                                 user?.role === 'admin' ||
                                 user?.role === 'ADMIN'

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', content: 'Forge AI connection established. I can help you evaluate opportunities and draft proposals.' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (forcedText = null) => {
    const textToSend = forcedText || input
    if (!textToSend.trim() || isTyping) return
    
    if (isGuest) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', content: 'Please sign in to use Forge AI features.' }])
      return
    }
    
    if (!hasActiveSubscription) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', content: 'Upgrade to a paid plan to unlock unlimited AI assistance.' }])
      return
    }

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: textToSend }
    setMessages(prev => [...prev, userMsg])
    if (!forcedText) setInput('')
    setIsTyping(true)

    try {
      const response = await api.post('/chat', {
        message: textToSend,
        opportunity_id: opportunity_id || null
      })

      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'system', 
        content: response.data.content
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Chat Error:', error)
      let errorMessage = 'Forge AI Engine is currently offline. Please try again.'
      if (error.response?.status === 403) {
        errorMessage = 'Subscription required. Please upgrade your plan to use Forge AI.'
      }
      const errorMsg = { 
        id: Date.now() + 1, 
        role: 'system', 
        content: errorMessage
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // Don't show chat button for guests - they need to sign in first
  if (isGuest) {
    return null
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 w-14 h-14 rounded-full ${hasActiveSubscription ? 'bg-[var(--accent-forge)]' : 'bg-gray-600'} text-[var(--bg-espresso)] shadow-[0_4px_20px_rgba(255,107,26,0.4)] flex items-center justify-center z-50
          ${isOpen ? 'hidden' : 'flex'}
        `}
      >
        {hasActiveSubscription ? (
          <MessageSquare size={24} fill="currentColor" />
        ) : (
          <Lock size={24} />
        )}
        {/* Notification Dot */}
        {hasActiveSubscription && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[var(--status-success)] border-2 border-[var(--bg-espresso)]"></span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-[var(--bg-walnut)] border border-[var(--border-glow)] rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-espresso)]/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[var(--bg-mahogany)] flex items-center justify-center text-[var(--accent-forge)]">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Forge AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasActiveSubscription ? 'bg-[var(--status-success)] animate-pulse' : 'bg-yellow-500'}`}></span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">
                      {hasActiveSubscription ? 'Online' : 'Locked'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-espresso)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Subscription Gate */}
            {!hasActiveSubscription ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-forge)]/10 flex items-center justify-center mb-4">
                  <Crown size={32} className="text-[var(--accent-forge)]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Unlock Forge AI</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Get unlimited AI-powered opportunity analysis, proposal drafting, and personalized recommendations.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/settings/billing')}
                  className="btn btn-primary"
                >
                  Upgrade Now
                </button>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--bg-mahogany)]">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`
                          max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                          ${msg.role === 'user' 
                            ? 'bg-[var(--accent-forge)] text-[var(--bg-espresso)] rounded-tr-sm' 
                            : 'bg-[var(--bg-espresso)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'}
                        `}
                      >
                        {msg.role === 'system' && (
                           <div className="flex items-center gap-1.5 text-[var(--accent-forge)] text-xs font-bold mb-1 opacity-80">
                             <Sparkles size={10} /> AI AGENT
                           </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-[var(--bg-espresso)] border border-[var(--border-subtle)] p-3 rounded-2xl rounded-tl-sm flex gap-1">
                         <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce delay-0"></span>
                         <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce delay-100"></span>
                         <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce delay-200"></span>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-espresso)]/50">
                  {/* Suggestions */}
                  {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[var(--bg-walnut)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent-forge)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about this opportunity..."
                      className="w-full bg-[var(--bg-walnut)] border border-[var(--border-subtle)] rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[var(--accent-forge)] transition-colors"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--accent-forge)] text-[var(--bg-espresso)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff8547] transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
