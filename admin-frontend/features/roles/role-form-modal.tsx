'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Role, Permission } from '@/types';
import { rolesApi } from './roles-api';

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role | null;
}

export function RoleFormModal({
  open,
  onClose,
  onSuccess,
  role,
}: RoleFormModalProps) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      rolesApi.listPermissions().then(setPermissions).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setSelectedPermissions(role.permissions?.map((p) => p.name) || []);
    } else {
      setName('');
      setSelectedPermissions([]);
    }
    setError(null);
  }, [role, open]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role) {
        await rolesApi.updateRole(role.id, {
          name,
          permissions: selectedPermissions,
        });
      } else {
        await rolesApi.createRole({
          name,
          permissions: selectedPermissions,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={role ? 'Edit System Role' : 'Create System Role'}
      description="Define role name and assign granular platform capabilities"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Role Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. billing-manager"
            required
          />
        </FormField>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Permissions ({selectedPermissions.length} selected)
          </label>
          <div className="max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {permissions.map((p) => {
              const checked = selectedPermissions.includes(p.name);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                    checked
                      ? 'bg-violet-600/15 border-violet-500/40 text-violet-300 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePermission(p.name)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700 focus:ring-violet-500"
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
