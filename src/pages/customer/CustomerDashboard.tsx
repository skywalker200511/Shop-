import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileWarning, CheckCircle, Clock, Star, MessageSquare, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import type { Complaint, Comment } from '@/types';
import { ComplaintStatus } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({ openComplaints: 0, resolvedThisMonth: 0, avgResponseTime: 'N/A', satisfactionScore: 'N/A' });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeComments, setActiveComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [complaintsData, profileData] = await Promise.all([
          supabaseService.getCustomerComplaints(),
          supabaseService.getCustomerProfile(user.id).catch(() => null)
        ]);
        
        setComplaints(complaintsData);
        
        if (profileData) {
          const metricsData = await supabaseService.getCustomerDashboardMetrics(profileData.id);
          setMetrics(metricsData);
        }
      } catch (error) {
        toast.error('Failed to load complaints');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setIsCommentsLoading(true);
    try {
      const fetchedComments = await supabaseService.getComments(id);
      setActiveComments(fetchedComments);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load messages');
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !expandedId) return;
    setIsSendingComment(true);
    try {
      const newComment = await supabaseService.addComment(expandedId, user.id, commentText, false);
      setActiveComments(prev => [...prev, newComment]);
      toast.success('Message sent!');
      setCommentText('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingComment(false);
    }
  };

  const stats = [
    { label: 'Open Complaints', value: metrics.openComplaints.toString(), icon: FileWarning, color: 'text-[#E11D48]' },
    { label: 'Resolved This Month', value: metrics.resolvedThisMonth.toString(), icon: CheckCircle, color: 'text-[#74D8BD]' },
    { label: 'Avg Response Time', value: metrics.avgResponseTime, icon: Clock, color: 'text-[#3B82F6]' },
    { label: 'Satisfaction Score', value: metrics.satisfactionScore, icon: Star, color: 'text-amber-500' },
  ];

  const steps = [
    { status: ComplaintStatus.Open, label: 'Submitted' },
    { status: ComplaintStatus.Assigned, label: 'Assigned' },
    { status: ComplaintStatus.InProgress, label: 'In Progress' },
    { status: ComplaintStatus.Resolved, label: 'Resolved' }
  ];

  const getStepIndex = (status: ComplaintStatus) => {
    const idx = steps.findIndex(s => s.status === status);
    if (status === ComplaintStatus.Closed) return 4;
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#0a0a0a] font-inter"
          >
            Welcome back, {user?.full_name || 'Customer'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#4a4a4a] mt-2 font-inter"
          >
            Track and manage your support requests
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/customer/submit')}
          className="bg-[#E11D48] hover:bg-rose-700 text-[#0a0a0a] px-6 py-3 rounded-[10px] font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)]"
        >
          <Plus className="w-5 h-5" /> New Complaint
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-6 flex items-center gap-4 border-l-4" style={{ borderLeftColor: stat.color.replace('text-[', '').replace(']', '') }}>
              <div className={cn("p-3 rounded-full bg-white", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[#4a4a4a] text-sm font-inter">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0a0a0a] font-jetbrains">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Complaints List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4 font-inter">My Complaints</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="h-16 animate-pulse bg-white/50" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState 
            icon={<FileWarning className="w-12 h-12" />}
            title="No complaints yet" 
            description="Submit your first complaint to get started." 
            action={
              <button 
                onClick={() => navigate('/customer/submit')}
                className="bg-[#E11D48] hover:bg-rose-700 text-[#0a0a0a] px-4 py-2 rounded-[10px] font-medium"
              >
                Submit Complaint
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <GlassCard key={complaint.id} className="overflow-hidden transition-all duration-300">
                <div 
                  onClick={() => toggleExpand(complaint.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#f5f5f0] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-[#4a4a4a] font-jetbrains text-sm">{complaint.complaint_number}</span>
                    <h3 className="text-[#0a0a0a] font-medium truncate max-w-[200px] sm:max-w-[300px]">{complaint.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                    <span className="text-[#737370] text-sm hidden sm:inline-block font-inter">{formatDate(complaint.updated_at)}</span>
                    <button className="text-[#4a4a4a] hover:text-[#0a0a0a] p-1">
                      {expandedId === complaint.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === complaint.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#e0e0da] bg-white/50"
                    >
                      <div className="p-5 sm:p-6 space-y-8">
                        
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-medium text-[#4a4a4a] mb-2 uppercase font-jetbrains">Description</h4>
                          <p className="text-[#4a4a4a] text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                        </div>

                        {/* Tracker */}
                        <div>
                          <h4 className="text-sm font-medium text-[#4a4a4a] mb-4 uppercase font-jetbrains">Status Tracker</h4>
                          <div className="relative flex justify-between items-center max-w-3xl">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#e0e0da] z-0 rounded-full"></div>
                            
                            {steps.map((step, idx) => {
                              const currentIndex = getStepIndex(complaint.status);
                              const isCompleted = idx < currentIndex;
                              const isCurrent = idx === currentIndex;
                              
                              return (
                                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-colors",
                                    isCompleted ? "bg-[#E11D48] border-[#E11D48]" : 
                                    isCurrent ? "bg-white border-[#E11D48] shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse" : 
                                    "bg-white border-[#e0e0da]"
                                  )} />
                                  <span className={cn(
                                    "text-xs font-medium font-inter absolute top-6 whitespace-nowrap",
                                    isCompleted || isCurrent ? "text-[#4a4a4a]" : "text-[#737370]"
                                  )}>{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Message Thread */}
                        <div className="pt-6 border-t border-[#e0e0da]">
                          <h4 className="text-sm font-medium text-[#4a4a4a] mb-4 uppercase font-jetbrains">Messages</h4>
                          {isCommentsLoading ? (
                            <div className="animate-pulse space-y-3">
                              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-10 bg-gray-200 rounded w-1/2 ml-auto"></div>
                            </div>
                          ) : activeComments.filter(c => !c.is_internal).length === 0 ? (
                            <p className="text-sm text-[#737370] italic mb-4">No messages yet.</p>
                          ) : (
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                              {activeComments.filter(c => !c.is_internal).map((comment) => {
                                const isOwn = comment.user_id === user?.id;
                                return (
                                  <div key={comment.id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                                    <div className={cn(
                                      "px-4 py-2 rounded-2xl max-w-[80%] text-sm",
                                      isOwn ? "bg-[#3B82F6] text-white rounded-br-none" : "bg-white border border-[#e0e0da] text-[#0a0a0a] rounded-bl-none"
                                    )}>
                                      {comment.content}
                                    </div>
                                    <span className="text-xs text-[#737370] mt-1">
                                      {isOwn ? 'You' : comment.user?.full_name || 'Support'} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="pt-4 border-t border-[#e0e0da]">
                          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add a comment or ask for an update..."
                              disabled={isSendingComment}
                              className="flex-1 bg-white border border-[#e0e0da] rounded-[10px] p-3 text-sm text-[#0a0a0a] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all disabled:opacity-50"
                            />
                            <button
                              type="submit"
                              disabled={!commentText.trim() || isSendingComment}
                              className="bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-[10px] font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" /> {isSendingComment ? 'Sending...' : 'Send'}
                            </button>
                          </form>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
