'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, BarChart3, Search, Bell, ArrowRight, ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const stats = [
  { value: '500+', label: 'Live Opportunities' },
  { value: '54', label: 'Chains Tracked' },
  { value: 'AI', label: 'Powered Scoring' },
  { value: '24/7', label: 'Real-time Alerts' },
]

const features = [
  {
    icon: Search,
    title: 'Opportunity Discovery',
    desc: 'AI-curated airdrops, grants, testnets, and bounties from 54+ blockchains — updated in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Smart Scoring',
    desc: 'Every opportunity is scored by our AI engine for reward potential, risk, effort, and deadline urgency.',
  },
  {
    icon: Shield,
    title: 'Risk Analysis',
    desc: 'Contract audits, team reputation checks, and rug-pull detection so you never waste gas on scams.',
  },
  {
    icon: Bell,
    title: 'Deadline Alerts',
    desc: 'Automatic reminders before deadlines close. Never miss a high-value opportunity again.',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Intel',
    desc: 'From Ethereum to Solana, Arbitrum to Base — one dashboard for every chain that matters.',
  },
  {
    icon: Zap,
    title: 'Application Tracker',
    desc: 'Track every submission, draft proposals with AI, and monitor your Web3 portfolio in one place.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] overflow-hidden">
      {/* ══════ Animated Background ══════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,85,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#ff5500]/[0.06] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[50%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#ffaa00]/[0.04] blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#58a6ff]/[0.04] blur-[100px]"
        />
      </div>

      {/* ══════ Navbar ══════ */}
      <nav className="relative z-20 border-b border-[var(--border-default)] bg-[var(--bg-canvas)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/oppforge_logo.png" alt="OppForge" width={32} height={32} priority />
            <span className="text-lg font-bold tracking-tight">OppForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              Explore
            </Link>
            <Link
              href="/login"
              className="btn btn-primary text-sm px-5 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════ Hero ══════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-primary-muted)] border border-[#ff5500]/20 text-xs font-medium text-[#ff5500] mb-6"
          >
            <Zap size={12} />
            AI-Powered Web3 Intelligence Platform
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Never Miss a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">
              Web3 Opportunity
            </span>{' '}
            Again
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed"
          >
            OppForge scans 54+ blockchains to surface high-value airdrops, grants, testnets, and bounties — scored and ranked by AI so you focus on what matters.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/login"
              className="btn btn-primary text-base px-8 py-3 shadow-[0_0_30px_rgba(255,85,0,0.3)] hover:shadow-[0_0_40px_rgba(255,85,0,0.4)] group"
            >
              Start Free Trial
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-secondary text-base px-8 py-3 group"
            >
              Explore Dashboard
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center py-4 px-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]"
            >
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">
                {s.value}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════ Features ══════ */}
      <section className="relative z-10 border-t border-[var(--border-default)] bg-[var(--bg-primary)]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Your Unfair Advantage in Web3
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto">
              Everything you need to discover, evaluate, and act on Web3 opportunities before the crowd.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i * 0.5}
                className="glass-card relative p-6 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary-muted)] border border-[#ff5500]/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_16px_rgba(255,85,0,0.2)] transition-shadow">
                  <f.icon size={20} className="text-[#ff5500]" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Bottom CTA ══════ */}
      <section className="relative z-10 border-t border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">
                Forge Ahead
              </span>
              ?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-md mx-auto">
              Join hunters who use AI to find the most lucrative Web3 opportunities first.
            </p>
            <Link
              href="/login"
              className="btn btn-primary text-base px-10 py-3.5 shadow-[0_0_30px_rgba(255,85,0,0.3)] hover:shadow-[0_0_40px_rgba(255,85,0,0.4)]"
            >
              Start Your 7-Day Free Trial
            </Link>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="relative z-10 border-t border-[var(--border-default)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <Image src="/oppforge_logo.png" alt="OppForge" width={20} height={20} />
            <span>&copy; {new Date().getFullYear()} OppForge. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-[var(--text-secondary)] transition-colors">Dashboard</Link>
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
