'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Organization } from '@/types';
import { organizationsApi } from './organizations-api';

interface OrganizationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization?: Organization | null;
}

export function OrganizationFormModal({
  open,
  onClose,
  onSuccess,
  organization,
}: OrganizationFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [plan, setPlan] = useState<'free' | 'starter' | 'professional' | 'enterprise'>('enterprise');
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setEmail(organization.email || '');
      setPhone(organization.phone || '');
      setWebsite(organization.website || '');
      setPlan(organization.plan || 'enterprise');
      setTimezone(organization.timezone || 'America/New_York');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setPlan('enterprise');
      setTimezone('America/New_York');
    }
    setError(null);
  }, [organization, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email: email || undefined,
        phone: phone || undefined,
        website: website || undefined,
        plan,
        timezone,
      };

      if (organization) {
        await organizationsApi.update(organization.id, payload);
      } else {
        await organizationsApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={organization ? 'Edit Organization' : 'Create Tenant Organization'}
      description="Manage enterprise customer workspace tenancy and subscription tier"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Organization Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Business Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@org.com"
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0100"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Website">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </FormField>
          <FormField label="Subscription Tier">
            <Select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
            >
              <option value="free">Free Tier</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Primary Timezone">
          <Select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Chicago">America/Chicago (CST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {organization ? 'Update Organization' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
