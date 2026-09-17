'use client';

import React, { useState } from 'react';
import {
  Settings,
  Lock,
  User,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import customerApiClient from '@/lib/api/client';
import { useCrmAuthStore } from '@/stores/auth.store';

export default function CustomerSettingsPage() {
  const { user } = useCrmAuthStore();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      await customerApiClient.put('/auth/profile', profileData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    try {
      await customerApiClient.put('/auth/password', passwordData);
      setPasswordSuccess(true);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          Workspace & Security Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal credentials, contact details, and organization tenancy preferences
        </p>
      </div>

      {/* Organization Badge Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user?.organization?.name}</h3>
            <p className="text-xs text-slate-400">
              Subscription Plan: <span className="text-cyan-400 font-semibold uppercase">{user?.organization?.plan || 'Enterprise'}</span>
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Active Workspace
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Profile Information</h3>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Contact your organization administrator to update email.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Phone</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 555-0100"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Change Password</h3>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password updated successfully</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordData.password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
