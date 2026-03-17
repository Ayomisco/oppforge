'use client'

import React, { useState, useCallback } from 'react'
import { 
  Users, BarChart3, Shield, Eye, Search, ChevronDown, ChevronUp, 
  UserPlus, AlertTriangle, CheckCircle, XCircle, Trash2, Edit, 
  Flag, Verified, TrendingUp, Activity, Globe, PlusCircle, ArrowUpRight,
  Filter, RefreshCw, Download
} from 'lucide-react'
import useSWR from 'swr'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatDistanceToNow } from 'date-fns'
import { ADMIN_CHAINS } from '@/lib/chains'

const fetcher = url => api.get(url).then(res => res.data)

// ==================
// Sub-components
// ==================

function StatCard({ label, value, icon: Icon, color = '#ff5500', change }) {
  return (
    <div className="glass-card p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={18} />
        </div>
        {change !== undefined && (
          <span className={`text-[10px] font-mono font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-white tracking-wider">{value}</div>
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  )
}

function UserRow({ user, isAdmin, onRoleChange, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const roleColors = {
    admin: 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20',
    sub_admin: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20',
    moderator: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20',
    user: 'text-gray-400 bg-white/5 border-white/10',
  }
  const role = user.role || 'user'
  const roleClass = roleColors[role] || roleColors.user

  return (
    <div className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5500] to-[#cc4400] flex items-center justify-center text-[10px] font-black text-white shrink-0">
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-white font-bold truncate">{user.full_name || user.username || 'Anonymous'}</div>
          <div className="text-[10px] text-gray-500 font-mono truncate">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${roleClass}`}>
          {role.replace('_', ' ')}
        </span>
        <span className="text-[10px] text-gray-600 font-mono w-20 text-right">
          {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : '-'}
        </span>
        <span className="text-[10px] font-mono text-gray-500 w-8 text-center" title="Tracked missions">
          {user.tracked_count || 0}
        </span>
        {isAdmin && (
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors"
            >
              <ChevronDown size={14} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-8 z-50 w-44 bg-[#111] border border-white/10 rounded-lg shadow-xl py-1">
                {['admin', 'sub_admin', 'user'].filter(r => r !== role).map(r => (
                  <button 
                    key={r}
                    onClick={() => { onRoleChange(user.id, r); setShowActions(false) }}
                    className="w-full text-left px-3 py-2 text-[11px] font-mono text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Set as {r.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button 
                    onClick={() => { onDelete(user.id, user.email); setShowActions(false) }}
                    className="w-full text-left px-3 py-2 text-[11px] font-mono text-red-400 hover:bg-red-500/10"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OppRow({ opp, isAdmin, onFlag, onVerify, onEdit }) {
  const flagCount = opp.risk_flags?.length || 0
  return (
    <div className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] uppercase tracking-wider text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 rounded-sm border border-[#ffaa00]/20">
            {opp.category || 'Unknown'}
          </span>
          {opp.is_verified && (
            <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 rounded-sm border border-green-500/20 flex items-center gap-0.5">
              <Verified size={8} /> VERIFIED
            </span>
          )}
          {flagCount > 0 && (
            <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 rounded-sm border border-red-500/20 flex items-center gap-0.5">
              <AlertTriangle size={8} /> {flagCount} FLAGS
            </span>
          )}
          <span className="text-[9px] text-gray-600 font-mono">{opp.source}</span>
        </div>
        <div className="text-sm text-white font-bold truncate">{opp.title}</div>
        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
          Score: {opp.ai_score || 0} | Trust: {opp.trust_score || 70} | {opp.chain || 'Multi-chain'}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-[#10b981] pr-2">{opp.reward_pool || ''}</span>
        <button 
          onClick={() => onFlag(opp.id)} 
          className="p-1.5 hover:bg-yellow-500/10 rounded text-gray-500 hover:text-yellow-400 transition-colors"
          title="Flag"
        >
          <Flag size={14} />
        </button>
        {isAdmin && !opp.is_verified && (
          <button 
            onClick={() => onVerify(opp.id)} 
            className="p-1.5 hover:bg-green-500/10 rounded text-gray-500 hover:text-green-400 transition-colors"
            title="Verify"
          >
            <CheckCircle size={14} />
          </button>
        )}
        {isAdmin && (
          <button 
            onClick={() => onEdit(opp)} 
            className="p-1.5 hover:bg-blue-500/10 rounded text-gray-500 hover:text-blue-400 transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
        )}
      </div>
    </div>
  )
}


// ==================
// Flag Modal
// ==================
function FlagModal({ oppId, onClose }) {
  const [reason, setReason] = useState('inaccurate')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post(`/admin/opportunities/${oppId}/flag`, { flag_reason: reason, notes })
      toast.success('Opportunity flagged')
      onClose(true)
    } catch { toast.error('Failed to flag') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-white font-bold text-lg">Flag Opportunity</h3>
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-gray-500 uppercase">Reason</label>
          <select 
            value={reason} onChange={e => setReason(e.target.value)}
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white"
          >
            <option value="scam">Scam / Fraud</option>
            <option value="expired">Expired / Closed</option>
            <option value="duplicate">Duplicate</option>
            <option value="inaccurate">Inaccurate Info</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-gray-500 uppercase">Notes (optional)</label>
          <textarea 
            value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white h-20"
            placeholder="Additional details..."
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => onClose(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
          <button 
            onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 bg-[#ff5500] text-white rounded text-xs font-bold"
          >
            {submitting ? 'Flagging...' : 'Submit Flag'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ==================
// Edit Opportunity Modal
// ==================
function EditOppModal({ opp, onClose }) {
  const [form, setForm] = useState({
    title: opp.title || '',
    description: opp.description || '',
    url: opp.url || '',
    logo_url: opp.logo_url || '',
    category: opp.category || 'Grant',
    sub_category: opp.sub_category || '',
    chain: opp.chain || '',
    tags: (opp.tags || []).join(', '),
    reward_pool: opp.reward_pool || '',
    reward_token: opp.reward_token || '',
    estimated_value_usd: opp.estimated_value_usd || '',
    deadline: opp.deadline ? new Date(opp.deadline).toISOString().slice(0, 16) : '',
    start_date: opp.start_date ? new Date(opp.start_date).toISOString().slice(0, 16) : '',
    is_open: opp.is_open ?? true,
    ai_summary: opp.ai_summary || '',
    ai_strategy: opp.ai_strategy || '',
    ai_score: opp.ai_score || 0,
    trust_score: opp.trust_score || 70,
    difficulty: opp.difficulty || 'Intermediate',
    required_skills: (opp.required_skills || []).join(', '),
    mission_requirements: (opp.mission_requirements || []).join('\n'),
    risk_level: opp.risk_level || '',
    win_probability: opp.win_probability || 'Medium',
    is_verified: opp.is_verified || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        required_skills: form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        mission_requirements: form.mission_requirements ? form.mission_requirements.split('\n').map(r => r.trim()).filter(Boolean) : [],
        estimated_value_usd: form.estimated_value_usd ? parseFloat(form.estimated_value_usd) : null,
        ai_score: parseInt(form.ai_score) || 0,
        trust_score: parseInt(form.trust_score) || 70,
        deadline: form.deadline || null,
        start_date: form.start_date || null,
      }
      await api.put(`/admin/opportunities/${opp.id}`, payload)
      toast.success('Opportunity updated')
      onClose(true)
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const Field = ({ label, name, type = 'text', ...props }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-mono text-gray-500 uppercase">{label}</label>
      {type === 'textarea' ? (
        <textarea 
          value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white h-20"
          {...props}
        />
      ) : type === 'select' ? (
        <select 
          value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white"
          {...props}
        >{props.children}</select>
      ) : type === 'checkbox' ? (
        <input type="checkbox" checked={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.checked }))} />
      ) : (
        <input 
          type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white"
          {...props}
        />
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Edit Opportunity</h3>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-white"><XCircle size={20} /></button>
        </div>

        {/* Core */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Title" name="title" /></div>
          <Field label="URL" name="url" />
          <Field label="Logo URL" name="logo_url" />
        </div>

        <Field label="Description" name="description" type="textarea" />

        {/* Classification */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Category" name="category" type="select">
            {['Grant', 'Hackathon', 'Bounty', 'Airdrop', 'Testnet', 'Ambassador', 'Job', 'Other'].map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </Field>
          <Field label="Sub Category" name="sub_category" placeholder="DeFi, NFT, Infra..." />
          <Field label="Chain" name="chain" type="select">
            {ADMIN_CHAINS.map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </Field>
        </div>

        {/* Reward */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Reward Pool" name="reward_pool" placeholder="$50,000" />
          <Field label="Reward Token" name="reward_token" placeholder="USDC" />
          <Field label="Estimated USD" name="estimated_value_usd" type="number" />
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" name="start_date" type="datetime-local" />
          <Field label="Deadline" name="deadline" type="datetime-local" />
        </div>

        {/* Skills & Requirements */}
        <Field label="Tags (comma-separated)" name="tags" placeholder="Rust, DeFi, ZK" />
        <Field label="Required Skills (comma-separated)" name="required_skills" placeholder="Solidity, React, Node.js" />
        <Field label="Mission Requirements (one per line)" name="mission_requirements" type="textarea" placeholder="Must be a team of 2-4\nMust submit by deadline" />

        {/* Scoring */}
        <div className="grid grid-cols-4 gap-3">
          <Field label="AI Score" name="ai_score" type="number" />
          <Field label="Trust Score" name="trust_score" type="number" />
          <Field label="Difficulty" name="difficulty" type="select">
            {['Beginner', 'Intermediate', 'Expert'].map(d => <option key={d} value={d}>{d}</option>)}
          </Field>
          <Field label="Win Probability" name="win_probability" type="select">
            {['Low', 'Medium', 'High'].map(w => <option key={w} value={w}>{w}</option>)}
          </Field>
        </div>

        {/* AI Content */}
        <Field label="AI Summary" name="ai_summary" type="textarea" />
        <Field label="AI Strategy" name="ai_strategy" type="textarea" />

        {/* Flags */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Risk Level" name="risk_level" type="select">
            <option value="">None</option>
            {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r} value={r}>{r}</option>)}
          </Field>
          <div className="flex items-center gap-3 pt-5">
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} className="accent-[#ff5500]" />
              Verified
            </label>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" checked={form.is_open} onChange={e => setForm(f => ({ ...f, is_open: e.target.checked }))} className="accent-[#ff5500]" />
              Open
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => onClose(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#ff5500] text-white rounded text-xs font-bold">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ==================
// Create Opportunity Modal 
// ==================
function CreateOppModal({ onClose }) {
  const [form, setForm] = useState({
    title: '', url: '', description: '', logo_url: '',
    category: 'Grant', sub_category: '', chain: 'Multi-chain',
    tags: '', reward_pool: '', reward_token: '', estimated_value_usd: '',
    deadline: '', start_date: '', is_open: true,
    required_skills: '', mission_requirements: '',
    source: 'manual', trust_score: 100,
  })
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!form.title || !form.url) return toast.error('Title and URL are required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        required_skills: form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        mission_requirements: form.mission_requirements ? form.mission_requirements.split('\n').map(r => r.trim()).filter(Boolean) : [],
        estimated_value_usd: form.estimated_value_usd ? parseFloat(form.estimated_value_usd) : null,
        deadline: form.deadline || null,
        start_date: form.start_date || null,
      }
      await api.post('/opportunities', payload)
      toast.success('Mission deployed!')
      onClose(true)
    } catch (e) { 
      toast.error(e.response?.data?.detail || 'Failed to create') 
    }
    finally { setSaving(false) }
  }

  const Field = ({ label, name, type = 'text', required, ...props }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-mono text-gray-500 uppercase">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white h-20 focus:border-[#ff5500] transition-colors" {...props} />
      ) : type === 'select' ? (
        <select value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white" {...props}>{props.children}</select>
      ) : (
        <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#ff5500] transition-colors" {...props} />
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2"><PlusCircle size={20} className="text-[#ff5500]" /> Deploy New Mission</h3>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-white"><XCircle size={20} /></button>
        </div>

        <p className="text-[11px] text-gray-400">Manually create an opportunity when scraping is inactive or for custom missions.</p>

        {/* Core Info */}
        <div className="glass-card p-4 space-y-3">
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Core Information</div>
          <Field label="Mission Title" name="title" required placeholder="e.g. Arbitrum Short-Term Grants" />
          <Field label="Application / Source URL" name="url" required placeholder="https://..." />
          <Field label="Logo URL" name="logo_url" placeholder="https://...logo.png (optional)" />
          <Field label="Description" name="description" type="textarea" placeholder="What is this opportunity about?" />
        </div>

        {/* Classification */}
        <div className="glass-card p-4 space-y-3">
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Classification</div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Category" name="category" type="select">
              {['Grant', 'Hackathon', 'Bounty', 'Airdrop', 'Testnet', 'Ambassador', 'Job', 'Other'].map(c => 
                <option key={c} value={c}>{c}</option>
              )}
            </Field>
            <Field label="Sub-Category" name="sub_category" placeholder="DeFi, NFT, Infra..." />
            <Field label="Blockchain" name="chain" type="select">
              {ADMIN_CHAINS.map(c => 
                <option key={c} value={c}>{c}</option>
              )}
            </Field>
          </div>
          <Field label="Tags (comma-separated)" name="tags" placeholder="Rust, DeFi, ZK, Tooling" />
        </div>

        {/* Reward & Timeline */}
        <div className="glass-card p-4 space-y-3">
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Reward & Timeline</div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Reward Pool" name="reward_pool" placeholder="$50,000" />
            <Field label="Reward Token" name="reward_token" placeholder="USDC, ARB..." />
            <Field label="Estimated USD Value" name="estimated_value_usd" type="number" placeholder="50000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" name="start_date" type="datetime-local" />
            <Field label="Deadline" name="deadline" type="datetime-local" />
          </div>
        </div>

        {/* Requirements */}
        <div className="glass-card p-4 space-y-3">
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Requirements & Skills</div>
          <Field label="Required Skills (comma-separated)" name="required_skills" placeholder="Solidity, React, Node.js" />
          <Field label="Mission Requirements (one per line)" name="mission_requirements" type="textarea" placeholder="Team of 2-4 members&#10;Open source code required&#10;Demo video submission" />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => onClose(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-[#ff5500] text-white rounded text-xs font-bold shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:shadow-[0_0_30px_rgba(255,85,0,0.5)] transition-all">
            {saving ? 'Deploying...' : 'Deploy Mission'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ==================
// Main Admin Dashboard
// ==================
export default function AdminDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN'
  const isStaff = isAdmin || user?.role === 'sub_admin' || user?.role === 'SUB_ADMIN'

  const [activeTab, setActiveTab] = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [oppSearch, setOppSearch] = useState('')
  const [oppCategory, setOppCategory] = useState('all')
  const [flagModal, setFlagModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [createModal, setCreateModal] = useState(false)

  // Data fetching — add error tracking for debug
  const { data: stats, error: statsError, mutate: mutateStats, isLoading: statsLoading } = useSWR(
    isStaff ? '/admin/dashboard/stats' : null, 
    fetcher, 
    { 
      revalidateOnFocus: true, 
      shouldRetryOnError: true, 
      errorRetryCount: 5,
      errorRetryInterval: 2000,
      dedupingInterval: 30000,
      refreshInterval: 60000
    }
  )
  const { data: growth } = useSWR(isStaff ? '/admin/dashboard/user-growth?days=30' : null, fetcher)
  const { data: categories } = useSWR(isStaff ? '/admin/dashboard/category-breakdown' : null, fetcher)
  const { data: topOpps } = useSWR(isStaff ? '/admin/dashboard/top-opportunities' : null, fetcher)

  // Debug: log admin stats errors

  
  const userSearchParam = userSearch ? `&search=${encodeURIComponent(userSearch)}` : ''
  const { data: users, mutate: mutateUsers } = useSWR(
    isAdmin && activeTab === 'users' ? `/admin/users?limit=50${userSearchParam}` : null, 
    fetcher
  )
  
  const oppCategoryParam = oppCategory !== 'all' ? `&category=${oppCategory}` : ''
  const oppSearchParam = oppSearch ? `&search=${encodeURIComponent(oppSearch)}` : ''
  const { data: opps, mutate: mutateOpps } = useSWR(
    isStaff && activeTab === 'opportunities' ? `/admin/opportunities?limit=50${oppCategoryParam}${oppSearchParam}` : null,
    fetcher
  )

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      mutateUsers()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
  }, [mutateUsers])

  const handleDeleteUser = useCallback(async (userId, email) => {
    if (!confirm(`Permanently delete ${email}?`)) return
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted')
      mutateUsers()
      mutateStats()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
  }, [mutateUsers, mutateStats])

  const handleVerify = useCallback(async (oppId) => {
    try {
      await api.patch(`/opportunities/${oppId}/verify`)
      toast.success('Verified')
      mutateOpps()
    } catch { toast.error('Failed') }
  }, [mutateOpps])

  if (!isStaff) {
    return (
      <div className="p-20 text-center">
        <Shield className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-xl font-bold text-white mb-2">ACCESS DENIED</h1>
        <p className="text-gray-500 font-mono text-xs">You do not have staff-level clearance.</p>
      </div>
    )
  }

  const maxGrowth = growth ? Math.max(...growth.map(g => g.count), 1) : 1

  const tabs = [
    { key: 'overview', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ key: 'users', label: 'Users', icon: Users }] : []),
    { key: 'opportunities', label: 'Opportunities', icon: Globe },
  ]

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Shield className="text-[#ff5500]" /> Admin Command Center
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-tight">
            {isAdmin ? 'Full Admin Access' : 'Sub-Admin — Read-Only Analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white rounded text-[10px] font-mono font-bold uppercase shadow-[0_0_15px_rgba(255,85,0,0.3)]"
            >
              <PlusCircle size={14} /> Deploy Mission
            </button>
          )}
          <button 
            onClick={() => { mutateStats(); mutateOpps?.(); mutateUsers?.() }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white/[0.02] rounded-lg p-1 border border-white/5 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key 
                ? 'bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20' 
                : 'text-gray-500 hover:text-white border border-transparent'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Error Banner */}
          {statsError && (
            <div className="glass-card p-4 mb-4 border border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-xs font-bold text-red-400">
                    {statsError?.response?.status === 401 ? 'Authentication Required' : 
                     statsError?.response?.status === 403 ? 'Access Denied' : 
                     'Stats Load Failed'}
                  </span>
                </div>
                <button onClick={() => mutateStats()} className="text-xs font-bold text-[#ff5500] hover:underline">RETRY</button>
              </div>
              <div className="text-[10px] font-mono text-gray-500 ml-7">
                {statsError?.response?.status === 401 ? 'Your session may have expired. Try logging out and back in.' :
                 statsError?.response?.status === 403 ? 'Your account role does not have permission to view this data.' :
                 `Error ${statsError?.response?.status || 'Network'}: ${statsError?.response?.data?.detail || statsError?.message || 'Unknown error'}`}
              </div>
            </div>
          )}
          {statsLoading && !stats && (
            <div className="glass-card p-4 mb-4 border border-white/5 flex items-center gap-3">
              <RefreshCw size={14} className="text-[#ff5500] animate-spin" />
              <span className="text-xs font-mono text-gray-400">Loading analytics...</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Users" value={stats?.total_users ?? 0} icon={Users} color="#3b82f6" change={stats?.new_users_week} />
            <StatCard label="New Today" value={stats?.new_users_today ?? 0} icon={UserPlus} color="#3b82f6" />
            <StatCard label="Pro Users" value={stats?.pro_users ?? 0} icon={TrendingUp} color="#10b981" />
            <StatCard label="Staff" value={(stats?.admin_users ?? 0) + (stats?.sub_admin_users ?? 0)} icon={Shield} color="#ffaa00" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Opportunities" value={stats?.total_opportunities ?? 0} icon={Globe} color="#ff5500" />
            <StatCard label="Verified" value={stats?.verified_opportunities ?? 0} icon={Verified} color="#ffaa00" />
            <StatCard label="Active Missions" value={stats?.active_opportunities ?? 0} icon={Activity} color="#10b981" />
            <StatCard label="Expired" value={stats?.expired_opportunities ?? 0} icon={AlertTriangle} color="#ef4444" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Tracked Apps" value={stats?.total_tracked ?? 0} icon={Eye} color="#8b5cf6" />
            <StatCard label="Total Payments" value={stats?.total_payments ?? 0} icon={Activity} color="#10b981" />
            <StatCard label="Revenue (ETH)" value={stats?.total_revenue_eth != null ? stats.total_revenue_eth.toFixed(4) : '0'} icon={TrendingUp} color="#ffaa00" />
            <StatCard label="Payments This Month" value={stats?.payments_this_month ?? 0} icon={BarChart3} color="#ff5500" change={stats?.payments_this_month} />
          </div>

          {/* User Growth Chart (simple bar) */}
          <div className="glass-card p-6 mb-6 border border-white/5">
            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4">User Growth — Last 30 Days</h3>
            <div className="flex items-end gap-1 h-32">
              {(growth || []).map((point, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-[#ff5500]/60 rounded-t hover:bg-[#ff5500] transition-colors cursor-pointer"
                    style={{ height: `${(point.count / maxGrowth) * 100}%`, minHeight: point.count > 0 ? '4px' : '1px' }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] text-white bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {point.date}: {point.count}
                  </div>
                </div>
              ))}
              {(!growth || growth.length === 0) && (
                <div className="text-gray-600 text-xs font-mono text-center w-full py-8">No growth data yet</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4">Category Distribution</h3>
              <div className="space-y-3">
                {(categories || []).map((cat, i) => {
                  const maxCat = categories?.[0]?.count || 1
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-400 w-24 truncate">{cat.category}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-[#ff5500] rounded-full" style={{ width: `${(cat.count / maxCat) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-white w-8 text-right">{cat.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Tracked */}
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4">Most Tracked Missions</h3>
              <div className="space-y-2">
                {(topOpps || []).slice(0, 8).map((opp, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[10px] text-gray-600 font-mono w-4">{i + 1}.</span>
                      <span className="text-xs text-white truncate">{opp.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 rounded">{opp.category}</span>
                      <span className="text-[10px] font-mono text-[#ff5500] font-bold">{opp.track_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ USERS TAB (Admin only) ============ */}
      {activeTab === 'users' && isAdmin && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by email, username, or name..."
                className="w-full bg-black border border-white/10 rounded px-3 py-2 pl-9 text-sm text-white font-mono focus:border-[#ff5500] transition-colors"
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500">{users?.length || 0} users</span>
          </div>

          <div className="glass-card border border-white/5 overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">
              <span>User</span>
              <div className="flex items-center gap-6">
                <span className="w-20">Role</span>
                <span className="w-20 text-right">Joined</span>
                <span className="w-8 text-center" title="Tracked">T</span>
                <span className="w-6"></span>
              </div>
            </div>
            {(users || []).map(u => (
              <UserRow key={u.id} user={u} isAdmin={isAdmin} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} />
            ))}
            {(!users || users.length === 0) && (
              <div className="p-12 text-center text-gray-600 font-mono text-xs">No users found</div>
            )}
          </div>
        </>
      )}

      {/* ============ OPPORTUNITIES TAB ============ */}
      {activeTab === 'opportunities' && (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                value={oppSearch} onChange={e => setOppSearch(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full bg-black border border-white/10 rounded px-3 py-2 pl-9 text-sm text-white font-mono focus:border-[#ff5500] transition-colors"
              />
            </div>
            <select 
              value={oppCategory} onChange={e => setOppCategory(e.target.value)}
              className="bg-black border border-white/10 rounded px-3 py-2 text-sm text-white"
            >
              <option value="all">All Categories</option>
              {['Grant', 'Hackathon', 'Bounty', 'Airdrop', 'Testnet', 'Ambassador', 'Job'].map(c => 
                <option key={c} value={c}>{c}</option>
              )}
            </select>
            {isAdmin && (
              <button 
                onClick={() => setCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#ff5500]/10 border border-[#ff5500]/30 rounded text-[10px] font-mono font-bold text-[#ff5500]"
              >
                <PlusCircle size={14} /> Create
              </button>
            )}
            <span className="text-[10px] font-mono text-gray-500">{opps?.length || 0} results</span>
          </div>

          <div className="glass-card border border-white/5 overflow-hidden">
            {(opps || []).map(opp => (
              <OppRow 
                key={opp.id} opp={opp} isAdmin={isAdmin}
                onFlag={id => setFlagModal(id)}
                onVerify={handleVerify}
                onEdit={o => setEditModal(o)}
              />
            ))}
            {(!opps || opps.length === 0) && (
              <div className="p-12 text-center text-gray-600 font-mono text-xs">No opportunities found</div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {flagModal && <FlagModal oppId={flagModal} onClose={(refresh) => { setFlagModal(null); if (refresh) mutateOpps() }} />}
      {editModal && <EditOppModal opp={editModal} onClose={(refresh) => { setEditModal(null); if (refresh) mutateOpps() }} />}
      {createModal && <CreateOppModal onClose={(refresh) => { setCreateModal(false); if (refresh) mutateOpps() }} />}
    </div>
  )
}
