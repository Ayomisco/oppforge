'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Globe, Shield, Calendar, ExternalLink } from 'lucide-react'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'

// Mock Data (matches ID 1 from feed)
const MOCK_DETAIL = {
  id: '1',
  title: 'Solana Foundation Renaissance Hackathon',
  type: 'Hackathon',
  chain: 'Solana',
  reward: '$1,000,000+',
  deadline: '2026-02-14T23:59:00Z',
  source: 'Colosseum',
  url: 'https://colosseum.org/renaissance',
  description: `
    The Renaissance Hackathon is a global online competition focused on bringing the next wave of high-impact projects to the Solana ecosystem. 
    
    Tracks include:
    - **DeFi & Payments**: Building the future of finance.
    - **Consumer Apps**: Mobile-first experiences for mass adoption.
    - **DePIN**: Decentralized Physical Infrastructure Networks.
    - **Gaming**: On-chain games and infrastructure.
    - **DAO & Governance**: Tools for decentralized communities.
    
    Winners receive non-dilutive prizes and pre-seed investment opportunities from the Colosseum accelerator.
  `,
  requirements: [
    'Must be built on Solana',
    'Open source code repository',
    'Short video demo (max 3 mins)',
    'Working prototype deployed to devnet/mainnet'
  ],
  aiAnalysis: {
    score: 98,
    probability: 'High',
    summary: 'Perfect match for your Rust and React skills. Your previous DeFi project gives you a strong competitive edge in the payments track.',
    strategy: 'Focus on the "Consumer Apps" track but leverage your DeFi experience to build a mobile-first payment interface. Simplicity wins here.'
  }
}

export default function OpportunityDetail({ params }) {
  // In a real app, fetch data based on params.id
  const opp = MOCK_DETAIL 

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back Nav */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left, 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 rounded bg-[var(--bg-walnut)] border border-[var(--border-subtle)] text-xs font-mono uppercase tracking-wide text-[var(--text-secondary)]">
                {opp.type}
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-walnut)] border border-[var(--border-subtle)] text-xs font-mono uppercase tracking-wide text-[var(--text-secondary)]">
                {opp.chain}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{opp.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Globe size={16} /> {opp.source}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} /> Closing in 48h
              </div>
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                <span className="text-[var(--accent-gold)]">$</span> {opp.reward} Prize Pool
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Overview</h3>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-line">
              {opp.description}
            </div>
          </div>

          {/* Requirements */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Requirements</h3>
            <ul className="space-y-3">
              {opp.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <Shield size={16} className="text-[var(--accent-forge)] mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          {/* AI Analysis Panel */}
          <AIAnalysisPanel 
            score={opp.aiAnalysis.score}
            probability={opp.aiAnalysis.probability}
            summary={opp.aiAnalysis.summary}
            strategy={opp.aiAnalysis.strategy}
          />

          {/* Actions */}
          <div className="space-y-3">
            <a 
              href={opp.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary w-full justify-between group"
            >
              Official Page <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="btn btn-ghost w-full border border-[var(--border-subtle)]">
              Add to Tracker
            </button>
          </div>

          {/* Metadata */}
          <div className="p-4 rounded-lg bg-[var(--bg-walnut)]/50 border border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] space-y-2">
            <div className="flex justify-between">
              <span>Added:</span>
              <span>2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>Last Checked:</span>
              <span>10 mins ago</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
