'use client';

import { useState } from 'react';
import { Send, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Bug Report', 'UX / Design', 'Feature Request', 'Performance', 'Web3 / Payments', 'General'];

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    rating: 0,
    bugs: '',
    ux_feedback: '',
    feature_requests: '',
    comments: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://oppforge-backend-production.up.railway.app'}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Send className="text-green-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Thank You!</h1>
          <p className="text-gray-400 text-sm">Your feedback has been received. It helps us build something truly useful.</p>
          <Link href="/dashboard" className="inline-block px-6 py-2.5 bg-[#ff5500] text-white text-sm font-bold rounded hover:bg-[#ff5500]/90 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] text-white">
      <div className="max-w-2xl mx-auto p-6 py-12 space-y-8">
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded border border-white/10 hover:bg-white/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Platform Feedback</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">Help us improve — every detail matters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity */}
          <div className="bg-[#0d0b09] border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Your Info (Optional)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name or handle"
                className="bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email (for follow-up)" type="email"
                className="bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors" />
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#0d0b09] border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                  className={`px-3 py-1.5 rounded border text-xs font-mono font-bold transition-all ${
                    form.category === cat ? 'border-[#ff5500]/40 bg-[#ff5500]/10 text-[#ff5500]' : 'border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300'
                  }`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="bg-[#0d0b09] border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Overall Rating</h2>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(prev => ({ ...prev, rating: n }))}
                  className="p-2 transition-transform hover:scale-110">
                  <Star size={28} className={form.rating >= n ? 'text-[#ffaa00] fill-[#ffaa00]' : 'text-gray-700'} />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="bg-[#0d0b09] border border-white/5 rounded-lg p-6 space-y-5">
            <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Details</h2>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Bugs Encountered</label>
              <textarea name="bugs" value={form.bugs} onChange={handleChange} rows={3}
                placeholder="Describe any bugs, broken features, or errors you hit..."
                className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase">UX / Design Feedback</label>
              <textarea name="ux_feedback" value={form.ux_feedback} onChange={handleChange} rows={3}
                placeholder="What felt confusing, slow, or could be easier to use?"
                className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Feature Requests</label>
              <textarea name="feature_requests" value={form.feature_requests} onChange={handleChange} rows={3}
                placeholder="What features would make this more powerful for you?"
                className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Anything Else</label>
              <textarea name="comments" value={form.comments} onChange={handleChange} rows={3}
                placeholder="General thoughts, impressions, suggestions..."
                className="w-full bg-[#0a0806] border border-[#1a1512] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff5500] transition-colors resize-none" />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#ff5500] text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-[#ff5500]/90 disabled:opacity-50 transition-all">
            <Send size={16} />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
