import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormField({
  label,
  required,
  error,
  children,
  className,
  description,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {description && (
        <p className="text-[11px] text-slate-400">{description}</p>
      )}
      {children}
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
