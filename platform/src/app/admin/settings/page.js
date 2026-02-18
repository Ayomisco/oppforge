'use client';

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    AI_MODEL: 'llama-3-70b-8192',
    MAX_TOKENS: 4096,
    SCRAPER_INTERVAL: 3600,
    MIN_MATCH_SCORE: 75,
    ENABLE_AUTO_APPLY: false,
    MAINTENANCE_MODE: false
  });

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success('System Configuration Updated');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono text-white">SYSTEM_CONFIGURATION</h1>
        <Button onClick={handleSave} className="bg-[#ff5500] hover:bg-[#ff6600] text-white">
            <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Settings */}
        <section className="space-y-4 p-6 bg-[#111] border border-[#222] rounded-xl">
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">Core_Engine</h2>
            
            <div className="space-y-2">
                <label className="text-xs text-gray-400 font-mono">AI_MODEL_ID</label>
                <input 
                    type="text" 
                    value={config.AI_MODEL}
                    onChange={(e) => handleChange('AI_MODEL', e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#ff5500] focus:outline-none transition-colors font-mono"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-400 font-mono">SCRAPER_INTERVAL (Seconds)</label>
                <input 
                    type="number" 
                    value={config.SCRAPER_INTERVAL}
                    onChange={(e) => handleChange('SCRAPER_INTERVAL', parseInt(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#ff5500] focus:outline-none transition-colors font-mono"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-400 font-mono">MIN_MATCH_THRESHOLD</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" 
                        min="0" max="100"
                        value={config.MIN_MATCH_SCORE}
                        onChange={(e) => handleChange('MIN_MATCH_SCORE', parseInt(e.target.value))}
                        className="flex-1 accent-[#ff5500]"
                    />
                    <span className="text-sm font-bold text-[#ff5500] w-8">{config.MIN_MATCH_SCORE}%</span>
                </div>
            </div>
        </section>

        {/* Feature Flags */}
        <section className="space-y-4 p-6 bg-[#111] border border-[#222] rounded-xl">
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">Feature_Flags</h2>
            
            <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#333] rounded-lg">
                <div>
                    <div className="text-sm font-bold text-white">Auto-Apply Agent</div>
                    <div className="text-xs text-gray-500">Allow AI to submit applications autonomously</div>
                </div>
                <div 
                    onClick={() => handleChange('ENABLE_AUTO_APPLY', !config.ENABLE_AUTO_APPLY)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${config.ENABLE_AUTO_APPLY ? 'bg-[#ff5500]' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${config.ENABLE_AUTO_APPLY ? 'translate-x-5' : ''}`} />
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#333] rounded-lg">
                <div>
                    <div className="text-sm font-bold text-white">Maintenance Mode</div>
                    <div className="text-xs text-gray-500">Lock platform for updates</div>
                </div>
                <div 
                    onClick={() => handleChange('MAINTENANCE_MODE', !config.MAINTENANCE_MODE)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${config.MAINTENANCE_MODE ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                     <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${config.MAINTENANCE_MODE ? 'translate-x-5' : ''}`} />
                </div>
            </div>

            <div className="pt-4 border-t border-[#333]">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 rounded transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={12} /> RESET_DEFAULTS
                </button>
            </div>
        </section>

      </div>
    </div>
  )
}
