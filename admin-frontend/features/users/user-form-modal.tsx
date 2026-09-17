'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { AdminUser, Role } from '@/types';
import { usersApi } from './users-api';
import { rolesApi } from '../roles/roles-api';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: AdminUser | null;
}

export function UserFormModal({
  open,
  onClose,
  onSuccess,
  user,
}: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      rolesApi.listRoles().then(setRoles).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.roles?.[0]?.name || 'admin');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        role,
      };
      if (password) payload.password = password;

      if (user) {
        await usersApi.update(user.id, payload);
      } else {
        if (!password) {
          setError('Password is required for new users');
          setLoading(false);
          return;
        }
        await usersApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={user ? 'Edit Administrator' : 'Create Administrator'}
      description="System administrators manage platform tenants, users, and security settings"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Smith"
            required
          />
        </FormField>

        <FormField label="Email Address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@crm.internal"
            required
          />
        </FormField>

        <FormField
          label={user ? 'Change Password (optional)' : 'Password'}
          required={!user}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={!user}
          />
        </FormField>

        <FormField label="Assign System Role" required>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.length > 0 ? (
              roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))
            ) : (
              <>
                <option value="super-admin">super-admin</option>
                <option value="admin">admin</option>
                <option value="viewer">viewer</option>
              </>
            )}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {user ? 'Update Administrator' : 'Create Administrator'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
