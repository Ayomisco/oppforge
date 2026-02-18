'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Shield, MoreVertical, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Mock data until API endponts are ready
const MOCK_USERS = [
  { id: 1, username: 'neo_dev', email: 'neo@matrix.com', role: 'user', status: 'active', joined: '2023-11-01' },
  { id: 2, username: 'morpheus', email: 'morpheus@zion.com', role: 'admin', status: 'active', joined: '2023-10-15' },
  { id: 3, username: 'cypher', email: 'cypher@matrix.com', role: 'user', status: 'suspended', joined: '2023-12-05' },
  { id: 4, username: 'trinity', email: 'trin@zion.com', role: 'user', status: 'active', joined: '2023-11-20' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(false);

  // In real app, useQuery to fetch /admin/users
  
  const handleStatusToggle = (id) => {
    setUsers(users.map(u => 
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-mono text-white">USER_MANAGEMENT</h1>
            <p className="text-sm text-gray-500 font-mono">Total Agents: {users.length}</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-400 hover:text-white transition-colors">
                EXPORT_CSV
            </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[#0A0A0A] text-xs font-mono text-gray-500 uppercase tracking-wider border-b border-[#222]">
                    <th className="p-4 font-normal">Identity</th>
                    <th className="p-4 font-normal">Role</th>
                    <th className="p-4 font-normal">Status</th>
                    <th className="p-4 font-normal">Joined</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10">
                                    <Users size={14} className="text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">{user.username}</div>
                                    <div className="text-xs text-gray-600">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase border ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`} />
                                <span className="text-xs text-gray-400 capitalize">{user.status}</span>
                            </div>
                        </td>
                        <td className="p-4 text-xs font-mono text-gray-500">
                            {format(new Date(user.joined), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-4 text-right">
                           <button 
                                onClick={() => handleStatusToggle(user.id)}
                                className="p-2 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                                title={user.status === 'active' ? "Suspend User" : "Activate User"}
                           >
                                {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                           </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )
}
