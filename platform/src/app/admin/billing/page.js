'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreditCard, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminBilling() {
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [copiedTx, setCopiedTx] = useState(null);

  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-payments', limit, offset],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/payments', {
        params: { limit, offset }
      });
      return res.data;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const copyToClipboard = (text, txHash) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(txHash);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const getNetworkLabel = (network) => {
    const labels = {
      arbitrum: '🔴 Arbitrum One',
      sepolia: '🔵 Ethereum Sepolia',
      ethereum: '⚪ Ethereum Mainnet',
    };
    return labels[network] || network;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PaymentStatus.COMPLETED': 'bg-green-900/30 text-green-400 border-green-700/50',
      'PaymentStatus.PENDING': 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
      'PaymentStatus.FAILED': 'bg-red-900/30 text-red-400 border-red-700/50',
    };
    return colors[status] || 'bg-gray-900/30 text-gray-400 border-gray-700/50';
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const totalRevenue = (payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-mono tracking-tight flex items-center gap-2">
          <CreditCard size={28} /> PAYMENT_LEDGER
        </h1>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#ff5500]/20 hover:bg-[#ff5500]/30 border border-[#ff5500]/50 rounded text-[#ff5500] text-sm font-mono transition"
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          label="Total Payments" 
          value={payments?.length || 0}
          subtext={(payments || []).length === limit ? `Showing latest ${limit}...` : 'Complete list'}
        />
        <SummaryCard 
          label="Total Revenue (ETH)" 
          value={totalRevenue.toFixed(6)}
          subtext="Across all networks"
        />
        <SummaryCard 
          label="Avg Payment (ETH)" 
          value={(payments?.length ? (totalRevenue / payments.length) : 0).toFixed(6)}
          subtext="Average transaction size"
        />
      </div>

      {/* Payment Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] bg-[#0A0A0A]">
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Network</th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Transaction</th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {(payments || []).length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No payments recorded yet
                  </td>
                </tr>
              ) : (
                (payments || []).map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#0A0A0A]/50 transition">
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                      {new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-[#D4AF37] font-bold">
                      {parseFloat(payment.amount).toFixed(6)} ETH
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {getNetworkLabel(payment.network)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getStatusColor(payment.status)}`}>
                        {payment.status.replace('PaymentStatus.', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-[#0A0A0A] px-2 py-1 rounded text-gray-400 max-w-xs truncate">
                          {payment.tx_hash.slice(0, 10)}...{payment.tx_hash.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(payment.tx_hash, payment.id)}
                          className="p-1 hover:bg-white/10 rounded transition"
                          title="Copy tx hash"
                        >
                          <Copy size={14} className={copiedTx === payment.id ? 'text-green-400' : 'text-gray-400'} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getArbiscanLink(payment.tx_hash, payment.network)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff5500] hover:text-[#ff6600] flex items-center gap-1 transition"
                      >
                        View <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {(payments || []).length > 0 && (
        <div className="flex justify-between items-center gap-4">
          <div className="text-xs text-gray-500 font-mono">
            Showing {offset + 1} to {Math.min(offset + limit, offset + (payments?.length || 0))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed border border-[#333] rounded text-sm font-mono transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={(payments || []).length < limit}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed border border-[#333] rounded text-sm font-mono transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, subtext }) {
  return (
    <div className="p-6 bg-[#111] border border-[#222] rounded-xl">
      <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-600 font-mono">{subtext}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-mono tracking-tight">PAYMENT_LEDGER</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-[#111] border border-[#222] rounded-xl animate-pulse">
            <div className="h-4 bg-white/5 rounded mb-2 w-24" />
            <div className="h-8 bg-white/5 rounded mb-2" />
            <div className="h-3 bg-white/5 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="p-8 bg-[#111] border border-[#222] rounded-xl animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-xl">
      <h2 className="text-red-400 font-bold flex items-center gap-2">
        <CreditCard size={20} /> Error Loading Payments
      </h2>
      <p className="text-red-300 text-sm mt-2">{error?.message || 'Failed to fetch payment history'}</p>
    </div>
  );
}

function getArbiscanLink(txHash, network) {
  const explorers = {
    arbitrum: `https://arbiscan.io/tx/${txHash}`,
    sepolia: `https://sepolia.etherscan.io/tx/${txHash}`,
    ethereum: `https://etherscan.io/tx/${txHash}`,
  };
  return explorers[network] || `https://arbiscan.io/tx/${txHash}`;
}
