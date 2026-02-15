'use client'

import React, { useState } from 'react'
import { Send, Bot, User, Sparkles, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Greeting, hunter. I am Forge AI. I have scanned 14 new data sources today. How can I assist your pursuit of alpha?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `I've analyzed your request about "${userMsg.content}". Based on current on-chain metrics and governance forums, I recommend focusing on the Arbitrum STIP amendments. Would you like me to draft a proposal outline?` 
      }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-card border-[var(--glass-border)] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--bg-espresso)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--accent-forge)]/20 flex items-center justify-center text-[var(--accent-forge)] border border-[var(--accent-forge)]/30">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Forge AI <span className="text-[var(--accent-forge)]">v1.0</span></h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-500">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
            <button className="btn btn-secondary text-xs py-1.5">Clear History</button>
            <button className="btn btn-secondary text-xs py-1.5">Export Chat</button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${
              msg.role === 'ai' 
                ? 'bg-[var(--bg-walnut)] border-[var(--accent-forge)]/30 text-[var(--accent-forge)]' 
                : 'bg-[var(--bg-mahogany)] border-white/10 text-white'
            }`}>
              {msg.role === 'ai' ? <Terminal size={14} /> : <User size={14} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] p-4 rounded-lg font-mono text-sm leading-relaxed ${
              msg.role === 'ai'
                ? 'bg-[var(--bg-walnut)] border border-[var(--glass-border)] text-gray-300'
                : 'bg-[var(--accent-forge)]/10 border border-[var(--accent-forge)]/30 text-white shadow-[0_0_15px_rgba(255,85,0,0.1)]'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
             <div className="w-8 h-8 rounded bg-[var(--bg-walnut)] border border-[var(--accent-forge)]/30 flex items-center justify-center text-[var(--accent-forge)]">
               <Terminal size={14} />
             </div>
             <div className="flex items-center gap-1 h-8 px-2">
               <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
               <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
               <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--bg-espresso)] border-t border-[var(--glass-border)]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="INITIALIZE_COMMAND_SEQUENCE..."
            className="w-full bg-[#0a0806] text-white font-mono text-sm px-4 py-3 pr-12 rounded border border-[#1a1512] focus:outline-none focus:border-[#ff5500] focus:shadow-[0_0_15px_rgba(255,85,0,0.1)] transition-all placeholder-gray-700"
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
        <div className="mt-2 text-[10px] text-center text-gray-500 font-mono tracking-tighter uppercase">
          Forge AI v1.0 // Verify critical financial data // Alpha access only
        </div>
      </div>

    </div>
  )
}
