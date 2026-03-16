'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Users, Zap, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function BillingDashboard() {
  const [filterTier, setFilterTier] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');

  // Fetch revenue summary
  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      const res = await api.get('/billing/admin/revenue');
      return res.data;
    },
  });

  // Fetch all payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await api.get('/billing/admin/payments');
      return res.data;
    },
  });

  // Fetch all invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const res = await api.get('/billing/admin/invoices');
      return res.data;
    },
  });

  // Filter payments
  const filteredPayments = payments?.filter(p => {
    if (filterTier !== 'all' && p.tier !== filterTier) return false;
    if (filterNetwork !== 'all' && p.network !== filterNetwork) return false;
    return true;
  }) || [];

  const handleExportCSV = () => {
    if (!payments) return;
    
    const csv = [
      ['Date', 'User ID', 'Amount (ETH)', 'Tier', 'Network', 'TX Hash', 'Status'],
      ...payments.map(p => [
        new Date(p.created_at).toISOString(),
        p.user_id,
        p.amount,
        p.tier,
        p.network,
        p.tx_hash,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (revenueLoading || paymentsLoading || invoicesLoading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">BILLING_DASHBOARD</h1>
          <p className="text-sm text-gray-500 font-mono">Revenue analytics & payment tracking</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600/20 border border-green-600/50 rounded text-sm font-mono text-green-400 hover:bg-green-600/30 transition flex items-center gap-2"
        >
          <Download size={16} /> EXPORT CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`${revenue?.total_eth?.toFixed(4) || '0'} ETH`}
          icon={DollarSign}
          color="text-green-400"
          subtext={`${revenue?.total_payments || 0} payments`}
        />
        <StatCard
          title="Active Hunters"
          value={revenue?.active_hunters || 0}
          icon={Users}
          color="text-blue-400"
          subtext={`paid subscribers`}
        />
        <StatCard
          title="Revenue by Tier"
          value={revenue?.by_tier?.hunter?.count || 0}
          icon={Zap}
          color="text-orange-400"
          subtext={`Hunter tier sales`}
        />
        <StatCard
          title="Network Breakdown"
          value={revenue?.by_network?.arbitrum?.count || 0}
          icon={TrendingUp}
          color="text-purple-400"
          subtext={`Arbitrum transactions`}
        />
      </div>

      {/* Revenue by Tier */}
      {revenue?.by_tier && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">
            Revenue by Tier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(revenue.by_tier).map(([tier, data]) => (
              <div key={tier} className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg">
                <div className="text-sm font-bold text-gray-300 uppercase">{tier}</div>
                <div className="text-2xl font-bold text-white mt-2">{data.total_eth.toFixed(4)} ETH</div>
                <div className="text-xs text-gray-500 mt-2">{data.count} transactions</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="px-3 py-2 bg-[#111] border border-[#222] rounded text-xs font-mono text-gray-300 hover:border-[#444] transition"
        >
          <option value="all">All Tiers</option>
          <option value="hunter">Hunter</option>
          <option value="scout">Scout</option>
        </select>

        <select
          value={filterNetwork}
          onChange={(e) => setFilterNetwork(e.target.value)}
          className="px-3 py-2 bg-[#111] border border-[#222] rounded text-xs font-mono text-gray-300 hover:border-[#444] transition"
        >
          <option value="all">All Networks</option>
          <option value="arbitrum">Arbitrum One</option>
          <option value="sepolia">Sepolia</option>
        </select>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#222]">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500">
            Recent Payments ({filteredPayments.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A0A0A] text-gray-500 border-b border-[#222]">
                <th className="p-4 font-mono">Date</th>
                <th className="p-4 font-mono">User</th>
                <th className="p-4 font-mono">Amount</th>
                <th className="p-4 font-mono">Tier</th>
                <th className="p-4 font-mono">Network</th>
                <th className="p-4 font-mono">TX Hash</th>
                <th className="p-4 font-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b border-[#222] hover:bg-[#0A0A0A]/50 transition">
                    <td className="p-4 text-gray-300">
                      {format(new Date(p.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[10px]">
                      {p.user_id.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-green-400 font-bold">
                      {parseFloat(p.amount).toFixed(4)} ETH
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-[10px] font-mono uppercase">
                        {p.tier}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[10px]">
                      {p.network}
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[10px]">
                      <a
                        href={`https://arbiscan.io/tx/${p.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition"
                      >
                        {p.tx_hash.slice(0, 10)}...
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-mono">
                        {p.status || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase text-gray-500 mb-4">Network Distribution</h3>
          <div className="space-y-3">
            {revenue?.by_network && Object.entries(revenue.by_network).map(([net, data]) => (
              <div key={net} className="flex justify-between items-center">
                <span className="text-gray-400 capitalize">{net}</span>
                <span className="text-white font-bold">{data.total_eth.toFixed(4)} ETH</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase text-gray-500 mb-4">Top Payers (Last 7 Days)</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p>Top 5 users by payment amount</p>
            <p className="text-gray-600">Aggregation coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtext }) {
  return (
    <div className="p-6 bg-[#111] border border-[#222] rounded-xl flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && <div className="text-xs text-gray-600 mt-1">{subtext}</div>}
      </div>
    </div>
  );
}
