import React from 'react';
import { ComplaintStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const colors = {
    [ComplaintStatus.Open]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    [ComplaintStatus.Assigned]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    [ComplaintStatus.InProgress]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [ComplaintStatus.Resolved]: 'bg-green-500/10 text-green-500 border-green-500/20',
    [ComplaintStatus.Closed]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    [ComplaintStatus.Reopened]: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const label = status.replace('_', ' ');

  return (
    <span className={cn(
      'font-mono uppercase inline-flex items-center justify-center border rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      colors[status] || colors[ComplaintStatus.Open]
    )}>
      {label}
    </span>
  );
};
