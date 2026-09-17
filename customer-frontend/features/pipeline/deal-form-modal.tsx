'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Deal, Customer } from '@/types';
import { dealsApi } from './deals-api';
import { customersApi } from '../customers/customers-api';

interface DealFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deal?: Deal | null;
}

export function DealFormModal({
  open,
  onClose,
  onSuccess,
  deal,
}: DealFormModalProps) {
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'>('qualification');
  const [probability, setProbability] = useState('50');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      customersApi.list({ page: 1 }).then((res) => setCustomers(res.data || [])).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setCustomerId(deal.customer_id ? String(deal.customer_id) : '');
      setAmount(deal.amount ? String(deal.amount) : '');
      setStage(deal.stage || 'qualification');
      setProbability(deal.probability ? String(deal.probability) : '50');
      setExpectedCloseDate(deal.expected_close_date || '');
    } else {
      setName('');
      setCustomerId('');
      setAmount('');
      setStage('qualification');
      setProbability('50');
      setExpectedCloseDate('');
    }
    setError(null);
  }, [deal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<Deal> = {
        name,
        customer_id: parseInt(customerId),
        amount: parseFloat(amount),
        stage,
        probability: probability ? parseInt(probability) : null,
        expected_close_date: expectedCloseDate || null,
        currency: 'USD',
      };

      if (deal) {
        await dealsApi.update(deal.id, payload);
      } else {
        await dealsApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save deal opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={deal ? 'Edit Deal Opportunity' : 'Create New Opportunity'}
      description="Track expected contract revenue, customer link, and sales stage"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Deal Opportunity Title" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual Cloud Services Contract"
            required
          />
        </FormField>

        <FormField label="Customer Account" required>
          <Select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select Customer Account</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Contract Amount ($)" required>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              required
            />
          </FormField>
          <FormField label="Win Probability (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              placeholder="50"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Pipeline Stage">
            <Select value={stage} onChange={(e) => setStage(e.target.value as any)}>
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </Select>
          </FormField>
          <FormField label="Target Close Date">
            <Input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" variant="cyan" isLoading={loading}>
            {deal ? 'Update Opportunity' : 'Save Opportunity'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
