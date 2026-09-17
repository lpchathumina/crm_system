'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Customer } from '@/types';
import { customersApi } from './customers-api';

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export function CustomerFormModal({
  open,
  onClose,
  onSuccess,
  customer,
}: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'company' | 'individual'>('company');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setType(customer.type || 'company');
      setIndustry(customer.industry || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setWebsite(customer.website || '');
      setAnnualRevenue(customer.annual_revenue ? String(customer.annual_revenue) : '');
    } else {
      setName('');
      setType('company');
      setIndustry('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setAnnualRevenue('');
    }
    setError(null);
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<Customer> = {
        name,
        type,
        industry: industry || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        annual_revenue: annualRevenue ? parseFloat(annualRevenue) : null,
      };

      if (customer) {
        await customersApi.update(customer.id, payload);
      } else {
        await customersApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={customer ? 'Edit Customer Account' : 'Create New Customer'}
      description="Manage business accounts, enterprise clients, and individual accounts"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Account / Company Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Global Innovations"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Account Type">
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="company">Company / Organization</option>
              <option value="individual">Individual Client</option>
            </Select>
          </FormField>
          <FormField label="Industry">
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, Healthcare"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@company.com"
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0199"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Website">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.com"
            />
          </FormField>
          <FormField label="Annual Revenue ($)">
            <Input
              type="number"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(e.target.value)}
              placeholder="e.g. 500000"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {customer ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
