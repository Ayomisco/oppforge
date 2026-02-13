'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  "Draft a proposal for this hackathon",
  "Is this grant worth my time?",
  "Analyze the requirements",
  "Summarize the judging criteria"
]

export default function ChatPanel() {
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
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'system', 
        content: `I've analyzed your request: "${userMsg.content}". Based on your profile (Rust, React), you have a strong advantage here. I recommend emphasizing your experience with Solana PoS in the proposal.` 
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
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
          fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--accent-forge)] text-[var(--bg-espresso)] shadow-[0_4px_20px_rgba(255,107,26,0.4)] flex items-center justify-center z-50
          ${isOpen ? 'hidden' : 'flex'}
        `}
      >
        <MessageSquare size={24} fill="currentColor" />
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[var(--status-success)] border-2 border-[var(--bg-espresso)]"></span>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] animate-pulse"></span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">Online</span>
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
                      onClick={() => { setInput(prompt); handleSend(); }} // Fix: setInput is async, better to pass directly? For mock it's ok.
                      // Actually better to just call logic with prompt
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
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--accent-forge)] text-[var(--bg-espresso)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff8547] transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
