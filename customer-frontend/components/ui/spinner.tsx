import React from 'react';
import { cn } from '@/lib/utils/helpers';

export function Spinner({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'border-cyan-500 border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}
