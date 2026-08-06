import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
  aiInsight?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, subtitle, icon, trend, trendValue, accentColor = 'bg-primary', aiInsight, className
}) => {
  return (
    <GlassCard className={cn('p-5 flex flex-col', className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-on-surface-variant font-mono text-sm">{title}</h3>
        {icon && <div className={cn('p-2 rounded-md bg-surface-variant text-white', accentColor)}>{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-mono font-semibold text-white">{value}</span>
        {trend && trendValue && (
          <span className={cn(
            'flex items-center text-xs font-mono px-1.5 py-0.5 rounded-md bg-surface-variant',
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          )}>
            {trend === 'up' && <TrendingUp size={12} className="mr-1" />}
            {trend === 'down' && <TrendingDown size={12} className="mr-1" />}
            {trend === 'neutral' && <Minus size={12} className="mr-1" />}
            {trendValue}
          </span>
        )}
      </div>
      
      {subtitle && <p className="text-xs text-on-surface-variant mt-auto">{subtitle}</p>}
      
      {aiInsight && (
        <div className="mt-3 text-xs bg-blue-900/20 text-blue-300 border border-blue-500/20 p-2 rounded-md">
          <span className="font-semibold text-blue-400 mr-1">AI:</span> {aiInsight}
        </div>
      )}
    </GlassCard>
  );
};
