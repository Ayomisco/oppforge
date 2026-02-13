'use client'

import React from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Hunter Profile</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Display Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded p-2 text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
               <input type="email" defaultValue="john@example.com" className="w-full bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded p-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Skills & Interests</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">OppForge uses these to score opportunities for you.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Primary Skills</label>
              <div className="flex flex-wrap gap-2">
                {['Rust', 'Solidity', 'React', 'TypeScript', 'Python'].map(skill => (
                   <span key={skill} className="px-3 py-1 bg-[var(--accent-forge)]/10 text-[var(--accent-forge)] border border-[var(--accent-forge)]/20 rounded-full text-xs cursor-pointer hover:bg-[var(--accent-forge)]/20 transition-colors">
                     {skill} ×
                   </span>
                ))}
                <span className="px-3 py-1 bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                  + Add Skill
                </span>
              </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Preferred Chains</label>
               <div className="flex flex-wrap gap-2">
                 {['Solana', 'Ethereum', 'Arbitrum', 'Base'].map(chain => (
                    <span key={chain} className="px-3 py-1 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 rounded-full text-xs cursor-pointer hover:bg-[var(--accent-cyan)]/20 transition-colors">
                      {chain} ×
                    </span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="glass-card p-6 border-l-4 border-l-[var(--status-warning)]">
          <h2 className="text-xl font-bold mb-4">API Access</h2>
          <div className="flex items-center gap-2 mb-4">
             <input type="text" value="sk_live_xv89...23x" disabled className="flex-1 bg-[var(--bg-espresso)] border border-[var(--border-subtle)] rounded p-2 text-sm font-mono text-[var(--text-tertiary)]" />
             <button className="btn btn-secondary text-xs">Copy</button>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Keep this key secret. It grants full access to your account.</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
           <button className="btn btn-primary px-8">
             <Save size={16} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  )
}
