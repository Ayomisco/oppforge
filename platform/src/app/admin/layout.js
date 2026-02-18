'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Database, Settings, LogOut, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) return null;

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[#333] flex flex-col fixed h-full bg-[#0F0F0F]">
        <div className="p-6 border-b border-[#333] flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            <span className="font-mono font-bold tracking-widest text-red-500">ADMIN_CORE</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <NavItem href="/admin" icon={LayoutDashboard} label="Overview" />
            <NavItem href="/admin/users" icon={Users} label="User Management" />
            <NavItem href="/admin/scrapers" icon={Database} label="Scraper Health" />
            <NavItem href="/admin/settings" icon={Settings} label="System Config" />
        </nav>

        <div className="p-4 border-t border-[#333]">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <LogOut size={18} />
                <span className="text-xs font-mono uppercase tracking-wider">Exit_God_Mode</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    )
}
