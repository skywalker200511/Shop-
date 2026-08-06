import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  MoreHorizontal, 
  Sparkles,
  CheckCircle2,
  Timer,
  Frown,
  Shield,
  Radar,
  Activity
} from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { supabaseService } from '@/services/supabaseService';
import { cn } from '@/lib/utils';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: { end: number, duration?: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(easeOutQuad(percentage) * end);
      
      setCount(currentCount);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const chartData = [
  { name: 'Mon', value: 80 },
  { name: 'Tue', value: 90 },
  { name: 'Wed', value: 100 },
  { name: 'Thu', value: 120 },
  { name: 'Fri', value: 180 },
  { name: 'Sat', value: 280 },
  { name: 'Sun', value: 350 }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ total_complaints: 0, sla_breaches: 0, ai_accuracy: 0, avg_resolution_hours: 0 });
  const [volumeData, setVolumeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, chart] = await Promise.all([
          supabaseService.getAdminDashboardMetrics(),
          supabaseService.getWeeklyVolumeData()
        ]);
        setMetrics(metricsData);
        setVolumeData(chart);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} variant="metric" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-[400px] lg:col-span-2" />
          <LoadingSkeleton className="h-[400px] lg:col-span-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Metric Cards Row */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Total Complaints */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5 flex flex-col h-full border-l-4 border-l-[#E11D48]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-on-surface-variant font-mono text-sm">Total Complaints</h3>
              <div className="p-2 rounded-md bg-surface-variant text-white">
                <Activity size={18} className="text-[#E11D48]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-semibold text-white">
                <AnimatedCounter end={metrics.total_complaints} />
              </span>
            </div>

          </GlassCard>
        </motion.div>

        {/* AI Accuracy */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5 flex flex-col h-full border-l-4 border-l-[#3B82F6]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-on-surface-variant font-mono text-sm">AI Accuracy</h3>
              <div className="p-2 rounded-md bg-surface-variant text-white">
                <CheckCircle2 size={18} className="text-[#74D8BD]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-semibold text-white">98.4%</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-auto font-mono">Status: Optimal</p>
          </GlassCard>
        </motion.div>

        {/* Avg Resolution */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5 flex flex-col h-full border-l-4 border-l-gray-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-on-surface-variant font-mono text-sm">Avg Resolution</h3>
              <div className="p-2 rounded-md bg-surface-variant text-white">
                <Timer size={18} className="text-gray-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-semibold text-white">{metrics.avg_resolution_hours.toFixed(1)}h</span>
              <span className="flex items-center text-xs font-mono px-1.5 py-0.5 rounded-md bg-surface-variant text-[#74D8BD]">
                <TrendingDown size={12} className="mr-1" />
                1.1h improvement
              </span>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Main Content Section */}
      <div className="w-full gap-6">
        {/* Weekly Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold font-mono">Weekly Volume</h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-surface-container-highest rounded-lg p-1">
                  <button className="px-3 py-1 text-xs font-mono text-white bg-surface-variant rounded-md shadow-sm">Weekly</button>
                  <button className="px-3 py-1 text-xs font-mono text-on-surface-variant hover:text-white transition-colors">Monthly</button>
                </div>
                <button className="text-on-surface-variant hover:text-white">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
            <div className="h-[300px] mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(225,29,72,0.2)" />
                      <stop offset="95%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrains Mono' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#2A2A2A', borderRadius: '8px', color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#E11D48' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#E11D48" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, fill: '#E11D48', stroke: '#171717', strokeWidth: 2 }}
                    dot={{ r: 4, fill: '#E11D48', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* High Priority Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-end px-1">
          <h2 className="text-white font-semibold font-mono">High Priority Alerts</h2>
          <a href="#" className="text-sm font-mono text-primary hover:underline">View All</a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <GlassCard className="p-4 border-l-4 border-l-[#E11D48] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/10 rounded-md">
                  <AlertTriangle size={16} className="text-[#E11D48]" />
                </div>
                <h4 className="text-sm text-white font-medium truncate">Enterprise Account Outage</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#E11D48] text-white rounded uppercase">Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <Frown size={14} className="text-[#E11D48]" />
              <span className="text-xs text-on-surface-variant font-mono">AI Sentiment: Very Angry</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-[#E11D48] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/10 rounded-md">
                  <AlertTriangle size={16} className="text-[#E11D48]" />
                </div>
                <h4 className="text-sm text-white font-medium truncate">API Rate Limit Exceeded</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#E11D48] text-white rounded uppercase">Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <Frown size={14} className="text-orange-400" />
              <span className="text-xs text-on-surface-variant font-mono">AI Sentiment: Frustrated</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-[#E11D48] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/10 rounded-md">
                  <Shield size={16} className="text-[#E11D48]" />
                </div>
                <h4 className="text-sm text-white font-medium truncate">Failed Login Spike</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#E11D48] text-white rounded uppercase">Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <Shield size={14} className="text-on-surface-variant" />
              <span className="text-xs text-on-surface-variant font-mono">Security: Possible brute force</span>
            </div>
          </GlassCard>

        </div>
      </motion.div>

    </div>
  );
};

export default DashboardPage;
