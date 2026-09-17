'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import adminApiClient from '@/lib/api/client';
import { useAdminAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAdminAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminApiClient.post('/auth/login', data);
      const { token, user } = res.data.data;
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="admin-login-form">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border text-white placeholder:text-slate-500 text-sm
            focus:outline-none focus:ring-2 focus:ring-violet-500 transition
            ${errors.email ? 'border-red-500/70' : 'border-slate-700'}`}
          placeholder="admin@company.com"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border text-white placeholder:text-slate-500 text-sm
            focus:outline-none focus:ring-2 focus:ring-violet-500 transition
            ${errors.password ? 'border-red-500/70' : 'border-slate-700'}`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        id="admin-login-btn"
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25
          focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in to Admin Panel'
        )}
      </button>
    </form>
  );
}
