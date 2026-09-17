'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Lead } from '@/types';
import { leadsApi } from './leads-api';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: Lead | null;
}

export function LeadFormModal({
  open,
  onClose,
  onSuccess,
  lead,
}: LeadFormModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [source, setSource] = useState('website');
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'>('new');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setFirstName(lead.first_name || '');
      setLastName(lead.last_name || '');
      setCompanyName(lead.company_name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setJobTitle(lead.job_title || '');
      setSource(lead.source || 'website');
      setStatus(lead.status || 'new');
      setEstimatedValue(lead.estimated_value ? String(lead.estimated_value) : '');
      setNotes(lead.description || '');
    } else {
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setSource('website');
      setStatus('new');
      setEstimatedValue('');
      setNotes('');
    }
    setError(null);
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        email: email || undefined,
        phone: phone || undefined,
        job_title: jobTitle || undefined,
        source,
        status,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
        notes: notes || undefined,
      };

      if (lead) {
        await leadsApi.update(lead.id, payload as any);
      } else {
        await leadsApi.create(payload as any);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lead record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={lead ? 'Edit Prospect Lead' : 'Capture New Lead'}
      description="Record prospect contact details, origin source, and pipeline estimated value"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Sarah"
              required
            />
          </FormField>
          <FormField label="Last Name" required>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Connor"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Company Name">
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Innovations"
            />
          </FormField>
          <FormField label="Job Title">
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. VP Operations"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@company.com"
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0155"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Lead Source">
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="linkedin">LinkedIn</option>
              <option value="cold_outreach">Cold Outreach</option>
            </Select>
          </FormField>
          <FormField label="Lead Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
            </Select>
          </FormField>
          <FormField label="Est. Value ($)">
            <Input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="15000"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" variant="cyan" isLoading={loading}>
            {lead ? 'Update Lead' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
