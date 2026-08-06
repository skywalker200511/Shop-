import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiBadgeProps {
  pulse?: boolean;
  className?: string;
}

export const AiBadge: React.FC<AiBadgeProps> = ({ pulse, className }) => {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 bg-[#1e3a8a] text-blue-200 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-500/30',
      pulse && 'animate-pulse',
      className
    )}>
      <Sparkles size={12} />
      <span>AI</span>
    </div>
  );
};
