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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <LoadingSkeleton key={i} variant="metric" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-[400px] lg:col-span-2" />
          <LoadingSkeleton className="h-[400px] lg:col-span-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#737370] mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* Metric Cards Row */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Total Complaints */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#e11d48]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-[#fff0f3] border border-[#fecdd3]">
                <Activity size={18} className="text-[#e11d48]" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#fff0f3] text-[#e11d48] rounded-full border border-[#fecdd3] uppercase tracking-wider">Live</span>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-black text-[#0a0a0a] tracking-tight font-mono">
                <AnimatedCounter end={metrics.total_complaints} />
              </div>
              <p className="text-sm font-medium text-[#737370] mt-1">Total Complaints</p>
              <div className="flex items-center gap-1 mt-3 text-[#e11d48]">
                <TrendingDown size={14} />
                <span className="text-xs font-mono font-semibold">Trending down 12%</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e11d48] to-[#fb7185] rounded-b-2xl" />
          </GlassCard>
        </motion.div>

        {/* AI Accuracy */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#2563eb]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
                <CheckCircle2 size={18} className="text-[#2563eb]" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#f0fdf4] text-[#16a34a] rounded-full border border-[#bbf7d0] uppercase tracking-wider">Optimal</span>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-black text-[#0a0a0a] tracking-tight font-mono">98.4%</div>
              <p className="text-sm font-medium text-[#737370] mt-1">AI Accuracy</p>
              <div className="flex items-center gap-1 mt-3 text-[#16a34a]">
                <TrendingUp size={14} />
                <span className="text-xs font-mono font-semibold">Model performing well</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#60a5fa] rounded-b-2xl" />
          </GlassCard>
        </motion.div>

        {/* Avg Resolution */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#059669]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                <Timer size={18} className="text-[#059669]" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#f0fdf4] text-[#059669] rounded-full border border-[#bbf7d0] uppercase tracking-wider">-1.1h</span>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-black text-[#0a0a0a] tracking-tight font-mono">
                {metrics.avg_resolution_hours.toFixed(1)}h
              </div>
              <p className="text-sm font-medium text-[#737370] mt-1">Avg Resolution Time</p>
              <div className="flex items-center gap-1 mt-3 text-[#059669]">
                <TrendingDown size={14} />
                <span className="text-xs font-mono font-semibold">1.1h improvement</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] to-[#34d399] rounded-b-2xl" />
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Weekly Volume Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-[#0a0a0a] font-bold text-lg">Weekly Volume</h2>
              <p className="text-xs text-[#737370] mt-0.5 font-mono">Complaint trends over the last 7 days</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-[#f5f5f0] rounded-xl p-1 border border-[#e0e0da]">
                <button className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-[#e11d48] rounded-lg shadow-sm">Weekly</button>
                <button className="px-3 py-1.5 text-xs font-mono text-[#737370] hover:text-[#0a0a0a] transition-colors">Monthly</button>
              </div>
              <button className="text-[#737370] hover:text-[#0a0a0a] transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData.length > 0 ? volumeData : chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(225,29,72,0.15)" />
                    <stop offset="95%" stopColor="rgba(225,29,72,0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0da" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737370', fontSize: 12, fontFamily: 'JetBrains Mono' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737370', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0e0da', borderRadius: '12px', color: '#0a0a0a', fontFamily: 'JetBrains Mono', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#e11d48' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E11D48" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, fill: '#E11D48', stroke: '#ffffff', strokeWidth: 2 }}
                  dot={{ r: 3, fill: '#E11D48', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* High Priority Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-[#0a0a0a] font-bold text-lg">High Priority Alerts</h2>
            <p className="text-xs text-[#737370] mt-0.5 font-mono">Requires immediate attention</p>
          </div>
          <a href="#" className="text-sm font-semibold text-[#e11d48] hover:underline">View All →</a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <GlassCard className="p-5 border-l-4 border-l-[#e11d48] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle size={15} className="text-[#e11d48]" />
                </div>
                <h4 className="text-sm text-[#0a0a0a] font-semibold">Enterprise Account Outage</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#e11d48] text-white rounded-full uppercase">Urgent</span>
            </div>
            <p className="text-xs text-[#737370]">Critical service disruption affecting enterprise tier</p>
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[#f0f0eb]">
              <Frown size={13} className="text-[#e11d48]" />
              <span className="text-xs text-[#737370] font-mono">AI Sentiment: Very Angry</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-l-4 border-l-[#f97316] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-100">
                  <AlertTriangle size={15} className="text-[#f97316]" />
                </div>
                <h4 className="text-sm text-[#0a0a0a] font-semibold">API Rate Limit Exceeded</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#f97316] text-white rounded-full uppercase">High</span>
            </div>
            <p className="text-xs text-[#737370]">Multiple endpoints returning 429 errors for users</p>
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[#f0f0eb]">
              <Frown size={13} className="text-orange-400" />
              <span className="text-xs text-[#737370] font-mono">AI Sentiment: Frustrated</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-l-4 border-l-[#8b5cf6] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 rounded-lg border border-purple-100">
                  <Shield size={15} className="text-[#8b5cf6]" />
                </div>
                <h4 className="text-sm text-[#0a0a0a] font-semibold">Failed Login Spike</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#8b5cf6] text-white rounded-full uppercase">Security</span>
            </div>
            <p className="text-xs text-[#737370]">Unusual login failure patterns detected in logs</p>
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[#f0f0eb]">
              <Shield size={13} className="text-[#8b5cf6]" />
              <span className="text-xs text-[#737370] font-mono">Security: Possible brute force</span>
            </div>
          </GlassCard>

        </div>
      </motion.div>

    </div>
  );
};

export default DashboardPage;
