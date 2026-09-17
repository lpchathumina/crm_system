'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Task, Customer } from '@/types';
import { tasksApi } from './tasks-api';
import { customersApi } from '../customers/customers-api';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
}

export function TaskFormModal({
  open,
  onClose,
  onSuccess,
  task,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      customersApi.list({ page: 1 }).then((res) => setCustomers(res.data || [])).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.due_date || '');
      setPriority(task.priority || 'medium');
      setCustomerId(task.customer_id ? String(task.customer_id) : '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setCustomerId('');
    }
    setError(null);
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<Task> = {
        title,
        description: description || null,
        due_date: dueDate || null,
        priority,
        customer_id: customerId ? parseInt(customerId) : null,
      };

      if (task) {
        await tasksApi.update(task.id, payload);
      } else {
        await tasksApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? 'Edit Action Item' : 'Create New Task'}
      description="Set deadlines, customer follow-up priorities, and team assignments"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Task Summary" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Master Services Agreement Review"
            required
          />
        </FormField>

        <FormField label="Notes & Checklist">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Action items, deliverables, and agenda..."
            className="w-full p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Priority Level">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormField>

          <FormField label="Due Date">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Associated Customer Account">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">No Customer Link (General Action)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" variant="cyan" isLoading={loading}>
            {task ? 'Update Task' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
