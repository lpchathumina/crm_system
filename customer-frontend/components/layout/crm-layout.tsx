'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  Kanban,
  BadgeDollarSign,
  CheckSquare,
  History,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useCrmAuthStore } from '@/stores/auth.store';
import customerApiClient from '@/lib/api/client';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', href: '/customers', icon: Building2 },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Leads', href: '/leads', icon: Target },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Deals', href: '/deals', icon: BadgeDollarSign },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Activities', href: '/activities', icon: History },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useCrmAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Auth Guard
    const token = localStorage.getItem('crm_token');
    if (!token && !pathname.startsWith('/login')) {
      router.replace('/login');
    }
  }, [pathname, router]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('crm_token');
        if (!token) return;
        const res = await customerApiClient.get('/notifications/unread-count');
        if (res.data?.data?.count !== undefined) {
          setUnreadCount(res.data.data.count);
        }
      } catch (err) {
        // ignore on initial load
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const res = await customerApiClient.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data?.data || null);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await customerApiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    logout();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">Enterprise CRM</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[120px] font-medium text-cyan-400">
                {user?.organization?.name || 'Workspace'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500 text-slate-950 font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Sales Representative'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'crm@tenant.io'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative w-72 sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, contacts, leads, deals..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-cyan-500 rounded-full ring-2 ring-slate-900" />
              )}
            </Link>

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {user?.organization?.plan ? user.organization.plan.toUpperCase() : 'ENTERPRISE'}
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Global Search Results Popup Modal */}
        {showSearchResults && (
          <div className="absolute top-16 left-6 right-6 sm:left-64 sm:right-10 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-slate-200">
                Search Results for "{searchQuery}"
              </h4>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
            {isSearching ? (
              <p className="py-6 text-center text-sm text-slate-400">Searching database...</p>
            ) : searchResults ? (
              <div className="py-3 space-y-4">
                {/* Customers */}
                {searchResults.customers?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Customers</h5>
                    <div className="space-y-1">
                      {searchResults.customers.map((c: any) => (
                        <Link
                          key={c.id}
                          href={`/customers/${c.id}`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-800 text-sm"
                        >
                          <span className="font-medium text-slate-200">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.industry || c.email}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {/* Contacts */}
                {searchResults.contacts?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Contacts</h5>
                    <div className="space-y-1">
                      {searchResults.contacts.map((c: any) => (
                        <Link
                          key={c.id}
                          href={`/contacts`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-800 text-sm"
                        >
                          <span className="font-medium text-slate-200">{c.first_name} {c.last_name}</span>
                          <span className="text-xs text-slate-400">{c.job_title} · {c.email}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {/* Leads */}
                {searchResults.leads?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Leads</h5>
                    <div className="space-y-1">
                      {searchResults.leads.map((l: any) => (
                        <Link
                          key={l.id}
                          href={`/leads`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-800 text-sm"
                        >
                          <span className="font-medium text-slate-200">{l.first_name} {l.last_name} ({l.company_name})</span>
                          <span className="text-xs text-cyan-400 font-semibold uppercase">{l.status}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {/* Deals */}
                {searchResults.deals?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Deals</h5>
                    <div className="space-y-1">
                      {searchResults.deals.map((d: any) => (
                        <Link
                          key={d.id}
                          href={`/deals`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-800 text-sm"
                        >
                          <span className="font-medium text-slate-200">{d.name}</span>
                          <span className="text-xs text-emerald-400 font-semibold">${d.amount?.toLocaleString()}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {/* If nothing found */}
                {(!searchResults.customers?.length && !searchResults.contacts?.length && !searchResults.leads?.length && !searchResults.deals?.length) && (
                  <p className="text-sm text-slate-400 py-4 text-center">No matching CRM records found.</p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 bg-slate-900 h-full flex flex-col z-10 border-r border-slate-800">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
              <span className="font-bold text-white">Enterprise CRM</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-cyan-600/20 text-cyan-400 font-bold' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
