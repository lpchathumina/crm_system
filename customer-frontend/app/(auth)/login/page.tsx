'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Building } from 'lucide-react';
import customerApiClient from '@/lib/api/client';
import { useCrmAuthStore } from '@/stores/auth.store';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { setAuth } = useCrmAuthStore();
  const [email, setEmail] = useState('sales@acme.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await customerApiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = res.data.data;
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials or organization inactive';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise CRM</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to your customer workspace</p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/60">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Test Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              Demo Organization Account
            </p>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
              <div>Email: <span className="text-cyan-400 font-medium">sales@acme.com</span></div>
              <div>Password: <span className="text-cyan-400 font-medium">Password@123</span></div>
              <div className="text-[11px] text-slate-400 font-sans mt-1 pt-1 border-t border-slate-800">
                Tenant: Acme Corporation (Enterprise Plan)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
