'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Server, ShieldCheck, Activity, Database, AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  // Fetch real dashboard stats from backend
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-mono tracking-tight">MISSION_CONTROL_OVERVIEW</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-[#111] border border-[#222] rounded-xl animate-pulse">
              <div className="h-8 bg-white/5 rounded mb-2" />
              <div className="h-4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-xl">
        <h2 className="text-red-400 font-bold">Error Loading Dashboard</h2>
        <p className="text-red-300 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-mono tracking-tight">MISSION_CONTROL_OVERVIEW</h1>
        <Link href="/admin/billing" className="text-[#ff5500] hover:text-[#ff6600] font-mono text-sm underline">
          → VIEW PAYMENTS
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="text-blue-400" />
        <StatCard title="Pro Users" value={stats?.pro_users || 0} icon={Activity} color="text-green-400" />
        <StatCard title="Total Missions" value={stats?.total_opportunities || 0} icon={Database} color="text-[#D4AF37]" />
        <StatCard title="Total Revenue" value={`${(stats?.total_revenue_eth || 0).toFixed(4)} ETH`} icon={CreditCard} color="text-purple-400" />
      </div>

      {/* Payment Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Payments This Month" value={stats?.payments_this_month || 0} icon={TrendingUp} color="text-orange-400" />
        <StatCard title="Revenue This Month" value={`${(stats?.revenue_this_month_eth || 0).toFixed(4)} ETH`} icon={TrendingUp} color="text-orange-400" />
        <StatCard title="Total Payments" value={stats?.total_payments || 0} icon={CreditCard} color="text-amber-400" />
      </div>

      {/* Opportunities Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricBox title="Active Opportunities" value={stats?.active_opportunities || 0} />
        <MetricBox title="Verified Opportunities" value={stats?.verified_opportunities || 0} />
        <MetricBox title="Expired Opportunities" value={stats?.expired_opportunities || 0} />
        <MetricBox title="Total Tracked Applications" value={stats?.total_tracked || 0} />
      </div>

      {/* Staff Breakdown */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
          <ShieldCheck size={16} /> Staff_Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg">
            <div className="text-2xl font-bold text-white">{stats?.admin_users || 0}</div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-2">Admins</div>
          </div>
          <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg">
            <div className="text-2xl font-bold text-white">{stats?.sub_admin_users || 0}</div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-2">Sub-Admins</div>
          </div>
          <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg">
            <div className="text-2xl font-bold text-white">{(stats?.total_users || 0) - (stats?.admin_users || 0) - (stats?.sub_admin_users || 0)}</div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-2">Regular Users</div>
          </div>
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

function MetricBox({ title, value }) {
    return (
        <div className="p-4 bg-[#111] border border-[#222] rounded-xl">
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">{title}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
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
