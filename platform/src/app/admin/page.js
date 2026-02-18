'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Server, ShieldCheck, Activity, Database, AlertTriangle } from 'lucide-react';

const mockStats = {
  total_users: 124,
  active_users: 42,
  total_opps: 85,
  scrapers: [
    { name: 'Superteam', status: 'operational', synced: '2m ago' },
    { name: 'DoraHacks', status: 'operational', synced: '15m ago' },
    { name: 'HackQuest', status: 'degraded', synced: '1h ago', error: '404' },
    { name: 'Gitcoin', status: 'offline', synced: 'Never' },
  ]
};

export default function AdminOverview() {
  // In real implementation, fetch from /admin/stats
  const stats = mockStats; 

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-mono tracking-tight">MISSION_CONTROL_OVERVIEW</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total_users} icon={Users} color="text-blue-400" />
        <StatCard title="Active Protocol" value={stats.active_users} icon={Activity} color="text-green-400" />
        <StatCard title="Total Missions" value={stats.total_opps} icon={Database} color="text-[#D4AF37]" />
        <StatCard title="System Health" value="98%" icon={Server} color="text-purple-400" />
      </div>

      {/* Scraper Health Grid */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
            <ShieldCheck size={16} /> Data_Pipeline_Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.scrapers.map((s) => (
                <div key={s.name} className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-300">{s.name}</span>
                        <StatusDot status={s.status} />
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        <div>SYNC: {s.synced}</div>
                        {s.error && <div className="text-red-500 mt-1">ERR: {s.error}</div>}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="p-6 bg-[#111] border border-[#222] rounded-xl flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{title}</div>
            </div>
        </div>
    )
}

function StatusDot({ status }) {
    const colors = {
        operational: 'bg-green-500 shadow-[0_0_8px_#22c55e]',
        degraded: 'bg-yellow-500 shadow-[0_0_8px_#eab308]',
        offline: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
    };
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-500'}`} />
            <span className="text-[10px] uppercase font-bold text-gray-400">{status}</span>
        </div>
    )
}
