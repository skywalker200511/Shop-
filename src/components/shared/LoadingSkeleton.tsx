import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'table-row' | 'metric' | 'chart';
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({ className, variant = 'card', ...props }) => {
  const baseClass = "animate-pulse bg-surface-variant rounded-md";
  
  if (variant === 'metric') {
    return (
      <div className={cn("glass-card p-4 space-y-3", className)} {...props}>
        <div className={cn(baseClass, "h-4 w-1/3")} />
        <div className={cn(baseClass, "h-8 w-1/2")} />
        <div className={cn(baseClass, "h-3 w-1/4")} />
      </div>
    );
  }
  
  return <div className={cn(baseClass, className)} {...props} />;
};
