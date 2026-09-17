'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  KeyRound,
  FileClock,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  ChevronRight,
  Menu,
  X,
  Server
} from 'lucide-react';
import { useAdminAuthStore } from '@/stores/auth.store';
import adminApiClient from '@/lib/api/client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Admin Users', href: '/users', icon: Users },
  { name: 'Roles', href: '/roles', icon: ShieldCheck },
  { name: 'Permissions', href: '/permissions', icon: KeyRound },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileClock },
  { name: 'System Settings', href: '/settings', icon: Settings },
  { name: 'System Reports', href: '/reports', icon: BarChart3 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await adminApiClient.post('/v1/admin/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      logout();
      router.push('/login');
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shrink-0">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">CRM ADMIN</span>
            <span className="text-[10px] text-indigo-400 font-mono block">CONTROL PANEL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Database Status & User Info */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate font-mono">MySQL: crm_admin</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-pulse"></span>
          </div>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-slate-200 capitalize">
              {pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Port 8001 Live
            </span>
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name?.[0] || 'A'}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bg-slate-900/95 border-b border-slate-800 backdrop-blur-xl z-20 p-4 space-y-1 shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
