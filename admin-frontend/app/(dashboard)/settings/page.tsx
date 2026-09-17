'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApiClient from '@/lib/api/client';
import { Settings, Save, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
  is_public: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminApiClient.get('/v1/admin/settings');
      return res.data.data;
    },
  });

  const settings: SystemSetting[] = data || [];

  useEffect(() => {
    if (settings.length > 0) {
      const map: Record<string, string> = {};
      settings.forEach((s) => {
        map[s.key] = s.value;
      });
      setSettingsMap(map);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { settings: Array<{ key: string; value: string }> }) => {
      await adminApiClient.put('/v1/admin/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.entries(settingsMap).map(([key, value]) => ({ key, value }));
    updateMutation.mutate({ settings: payload });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Platform & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Global parameters stored in MySQL table system_settings.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading platform configurations...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                General Configuration
              </h2>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">app.name</label>
                <input
                  type="text"
                  value={settingsMap['app.name'] || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, 'app.name': e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">app.maintenance_mode</label>
                <select
                  value={settingsMap['app.maintenance_mode'] || '0'}
                  onChange={(e) => setSettingsMap({ ...settingsMap, 'app.maintenance_mode': e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="0">Disabled (Online)</option>
                  <option value="1">Enabled (Maintenance Mode)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Plan Tier Limits (Max Organizations Per Plan)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Free Tier</label>
                  <input
                    type="number"
                    value={settingsMap['app.max_orgs_per_plan.free'] || '1'}
                    onChange={(e) =>
                      setSettingsMap({ ...settingsMap, 'app.max_orgs_per_plan.free': e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Starter Tier</label>
                  <input
                    type="number"
                    value={settingsMap['app.max_orgs_per_plan.starter'] || '5'}
                    onChange={(e) =>
                      setSettingsMap({ ...settingsMap, 'app.max_orgs_per_plan.starter': e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Professional Tier</label>
                  <input
                    type="number"
                    value={settingsMap['app.max_orgs_per_plan.professional'] || '20'}
                    onChange={(e) =>
                      setSettingsMap({ ...settingsMap, 'app.max_orgs_per_plan.professional': e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Enterprise Tier</label>
                  <input
                    type="number"
                    value={settingsMap['app.max_orgs_per_plan.enterprise'] || '-1'}
                    onChange={(e) =>
                      setSettingsMap({ ...settingsMap, 'app.max_orgs_per_plan.enterprise': e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-800">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-600/20 transition-all"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Platform Settings
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
