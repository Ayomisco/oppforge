'use client';

import { useState } from 'react';
import { Play, Pause, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const MOCK_SCRAPERS = [
  { id: 'superteam', name: 'Superteam Earn', status: 'operational', lastRun: new Date(Date.now() - 1000 * 60 * 5), itemsFound: 12, errorRate: '0%' },
  { id: 'dorahacks', name: 'DoraHacks', status: 'operational', lastRun: new Date(Date.now() - 1000 * 60 * 15), itemsFound: 8, errorRate: '0%' },
  { id: 'gitcoin', name: 'Gitcoin', status: 'degraded', lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), itemsFound: 0, errorRate: '15%' },
  { id: 'hackquest', name: 'HackQuest', status: 'offline', lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24), itemsFound: 0, errorRate: '100%' },
];

export default function AdminScrapersPage() {
  const [scrapers, setScrapers] = useState(MOCK_SCRAPERS);
  const [running, setRunning] = useState(null);

  const handleRunScraper = (id) => {
    setRunning(id);
    toast.loading(`Initializing retrieval agent for ${id}...`);
    
    // Simulate API call
    setTimeout(() => {
        toast.dismiss();
        toast.success(`${id.toUpperCase()} scan complete. 3 new opportunities found.`);
        setRunning(null);
        setScrapers(prev => prev.map(s => s.id === id ? { ...s, lastRun: new Date(), itemsFound: 3, status: 'operational' } : s));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-mono text-white">DATA_PIPELINE_STATUS</h1>
            <p className="text-sm text-gray-500 font-mono">Active Nodes: {scrapers.filter(s => s.status === 'operational').length}/{scrapers.length}</p>
        </div>
        <button className="px-3 py-2 bg-[#ff5500] hover:bg-[#ff6600] text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_#ff5500]/30">
            Run_All_Agents
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scrapers.map((scraper) => (
            <div key={scraper.id} className="p-6 bg-[#111] border border-[#222] rounded-xl flex items-center justify-between group hover:border-[#333] transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                        scraper.status === 'operational' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
                        scraper.status === 'degraded' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-red-500'
                    }`} />
                    <div>
                        <h3 className="text-lg font-bold text-white">{scraper.name}</h3>
                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> LAST_RUN: {formatDistanceToNow(scraper.lastRun)} ago</span>
                            <span className="flex items-center gap-1">YIELD: {scraper.itemsFound} items</span>
                            {scraper.errorRate !== '0%' && <span className="text-red-500">ERR_RATE: {scraper.errorRate}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleRunScraper(scraper.id)}
                        disabled={running === scraper.id}
                        className={`p-3 rounded-lg border transition-all ${
                            running === scraper.id 
                            ? 'bg-[#ff5500]/10 border-[#ff5500] text-[#ff5500] animate-pulse' 
                            : 'bg-[#0A0A0A] border-[#333] text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        {running === scraper.id ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}
