import React from 'react';
import { ComplaintPriority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const isCritical = priority === ComplaintPriority.Critical;
  
  const colors = {
    [ComplaintPriority.Critical]: 'bg-red-500/10 text-red-500 border-red-500/30',
    [ComplaintPriority.High]: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    [ComplaintPriority.Medium]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    [ComplaintPriority.Low]: 'bg-green-500/10 text-green-500 border-green-500/30',
  };

  return (
    <span className={cn(
      'font-mono uppercase inline-flex items-center px-2 py-0.5 rounded-md text-xs border font-medium',
      colors[priority] || colors[ComplaintPriority.Medium],
      isCritical && 'animate-pulse'
    )}>
      {priority}
    </span>
  );
};
