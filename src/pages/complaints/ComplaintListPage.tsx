import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState, ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Search,
  PlusCircle,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText
} from 'lucide-react';

import type { Complaint, Comment } from '@/types';
import { ComplaintPriority, ComplaintStatus, ComplaintCategory } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const newComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  customer_id: z.string().min(1, 'Customer is required'),
  department_id: z.string().min(1, 'Department is required'),
  category: z.nativeEnum(ComplaintCategory),
  priority: z.nativeEnum(ComplaintPriority),
  description: z.string().min(20, 'Please provide more details (minimum 20 characters)')
});

export default function ComplaintListPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Comments state
  const [activeComments, setActiveComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Filtering state
  const [globalFilter, setGlobalFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseService.getAllComplaints({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      });
      setData(result);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Slide-over & Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (selectedComplaint) {
      setIsCommentsLoading(true);
      supabaseService.getComments(selectedComplaint.id)
        .then(setActiveComments)
        .catch(console.error)
        .finally(() => setIsCommentsLoading(false));
    } else {
      setActiveComments([]);
      setMessageText('');
    }
  }, [selectedComplaint]);

  const handleSendMessage = async (isInternal: boolean) => {
    if (!selectedComplaint || !user || !messageText.trim()) return;
    setIsSendingMessage(true);
    try {
      const newComment = await supabaseService.addComment(selectedComplaint.id, user.id, messageText, isInternal);
      setActiveComments(prev => [...prev, newComment]);
      setMessageText('');
      toast.success(isInternal ? 'Internal note added' : 'Message sent to customer');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedComplaint) return;
    const newStatus = e.target.value as ComplaintStatus;
    if (!newStatus) return;

    setIsUpdating(true);
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }
      await supabaseService.updateComplaint(selectedComplaint.id, updates);
      setSelectedComplaint({ ...selectedComplaint, ...updates });
      setData(data.map(c => c.id === selectedComplaint.id ? { ...c, ...updates } : c));
      toast.success('Status updated');
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to update status: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof newComplaintSchema>>({
    resolver: zodResolver(newComplaintSchema),
    defaultValues: {
      title: '',
      customer_id: '',
      category: undefined,
      priority: undefined,
      department_id: '',
      description: ''
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    return data.filter(c => {
      const search = debouncedSearch.toLowerCase();
      const matchSearch = c.title.toLowerCase().includes(search) ||
                          c.complaint_number.toLowerCase().includes(search);
      // We no longer need to filter by priority/status/category here because we fetch them directly via supabaseService query!
      // But we can keep it as client-side filtering if we want to fetch all and filter client side.
      // Since supabaseService does the filtering, we just return matchSearch.
      return matchSearch;
    });
  }, [data, debouncedSearch]);

  const columns: any = useMemo(() => [
    {
      accessorKey: 'complaint_number',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-[#0a0a0a]" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Complaint # <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="font-mono text-sm text-[#e5bdbe]">{info.getValue()}</span>
    },
    {
      accessorKey: 'title',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-[#0a0a0a]" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="font-medium text-[#0a0a0a]">{info.getValue()}</span>
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-[#555550]">{row.customer?.company || row.customer?.user?.full_name || row.customer_id}</span>
      }
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: (info: any) => <PriorityBadge priority={info.getValue()} />
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-[#555550] capitalize">{row.category.replace('_', ' ')}</span>
      }
    },
    {
      accessorKey: 'department_id',
      header: 'Department',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-[#555550] capitalize">{row.department?.name || row.department_id}</span>
      }
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: (info: any) => <span className="text-[#555550]">{info.getValue()}</span>
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-[#0a0a0a]" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="text-[#555550]">{formatDate(info.getValue())}</span>
    },
    {
      accessorKey: 'sla_breached',
      header: 'SLA',
      cell: (info: any) => info.getValue() ? <span className="text-[#E11D48] font-semibold text-xs">BREACHED</span> : <span className="text-[#74D8BD] text-xs">ON TIME</span>
    }
  ], []);

  const table: any = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  } as any);

  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = ['Complaint #', 'Title', 'Customer', 'Priority', 'Status', 'Created'];
    const rows = filteredData.map(c => [
      c.complaint_number,
      `"${c.title}"`,
      `"${c.customer?.company || c.customer_id}"`,
      c.priority,
      c.status,
      c.created_at
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints.csv';
    a.click();
    toast.success('CSV Exported');
  };

  const exportPDF = () => {
    toast.success('PDF Export functionality triggered');
  };

  const onSubmit = async (data: z.infer<typeof newComplaintSchema>) => {
    try {
      await supabaseService.createComplaint(data as Partial<Complaint>);
      toast.success('Complaint created successfully');
      setIsNewModalOpen(false);
      reset();
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to create complaint');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setCategoryFilter('All');
  };

  return (
    <div className="p-6 w-full min-w-0 max-w-[1600px] mx-auto min-h-[calc(100vh-2rem)] my-4 bg-white/80 backdrop-blur-md text-[#0a0a0a] font-inter border-2 border-slate-200 shadow-xl rounded-[24px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-4 py-2 rounded-[10px] flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} />
          New Complaint
        </button>
      </div>

      <GlassCard className="p-4 mb-6" hover={false}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737370]" size={18} />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
            >
              <option value="All">All Categories</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Service">Service</option>
              <option value="Account">Account</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={clearFilters}
              className="text-[#737370] hover:text-[#0a0a0a] text-sm px-3 py-2"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="bg-[#fafaf7] border-2 border-slate-200 shadow-sm hover:bg-[#e0e0da] text-[#0a0a0a] px-3 py-2 rounded-[10px] flex items-center gap-2 transition-colors text-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="bg-[#fafaf7] border-2 border-slate-200 shadow-sm hover:bg-[#e0e0da] text-[#0a0a0a] px-3 py-2 rounded-[10px] flex items-center gap-2 transition-colors text-sm"
            >
              <FileText size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-6 overflow-hidden" hover={false}>
        {isLoading ? (
          <div className="p-4 space-y-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No complaints found"
            description="Try adjusting your filters or search term."
            action={<button onClick={clearFilters} className="bg-surface-variant hover:bg-surface-variant-highest text-[#0a0a0a] px-4 py-2 rounded-md font-medium text-sm">Clear Filters</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <tr key={headerGroup.id} className="border-b-2 border-slate-100 bg-white">
                    {headerGroup.headers.map((header: any) => (
                      <th key={header.id} className="p-4 font-semibold text-[#737370] text-sm whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row: any) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedComplaint(row.original)}
                    className="border-b-2 border-slate-100 hover:bg-[#fafaf7] cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="p-4 text-sm whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredData.length > 0 && (
          <div className="p-4 border-t-2 border-slate-100 flex items-center justify-between">
            <div className="text-sm text-[#737370]">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of{' '}
              {filteredData.length} entries
            </div>
            <div className="flex items-center gap-4">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] px-2 py-1 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
              >
                {[10, 25, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1 rounded bg-[#fafaf7] border-2 border-slate-200 shadow-sm disabled:opacity-50 text-[#0a0a0a] hover:bg-[#e0e0da] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1 rounded bg-[#fafaf7] border-2 border-slate-200 shadow-sm disabled:opacity-50 text-[#0a0a0a] hover:bg-[#e0e0da] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {selectedComplaint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-[#171717] border-l-2 border-slate-200 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b-2 border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#2a2a2a] px-2 py-1 rounded text-xs font-mono text-[#e5bdbe]">
                      {selectedComplaint.complaint_number}
                    </span>
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0a0a0a]">{selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-[#737370] hover:text-[#0a0a0a] transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-[#737370] uppercase tracking-wider mb-3">Customer Information</h3>
                  <div className="bg-white rounded-[10px] border-2 border-slate-200 shadow-sm p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-[#a0a09a]">Company</div>
                        <div className="font-medium">{selectedComplaint.customer?.company || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#a0a09a]">Contact</div>
                        <div className="font-medium">{selectedComplaint.customer?.user?.full_name || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-[#a0a09a]">Email</div>
                        <div className="font-medium text-[#3B82F6]">{selectedComplaint.customer?.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#737370] uppercase tracking-wider mb-3">Description</h3>
                  <div className="bg-white rounded-[10px] border-2 border-slate-200 shadow-sm p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#737370] uppercase tracking-wider mb-3">Timeline</h3>
                  <div className="bg-white rounded-[10px] border-2 border-slate-200 shadow-sm p-4 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-2 bg-[#74D8BD] rounded-full my-1"></div>
                      <div>
                        <div className="text-sm font-medium">Complaint Created</div>
                        <div className="text-xs text-[#a0a09a]">{formatDate(selectedComplaint.created_at)}</div>
                      </div>
                    </div>
                    {selectedComplaint.updated_at !== selectedComplaint.created_at && (
                      <div className="flex gap-4">
                        <div className="w-2 bg-[#3B82F6] rounded-full my-1"></div>
                        <div>
                          <div className="text-sm font-medium">Last Updated</div>
                          <div className="text-xs text-[#a0a09a]">{formatDate(selectedComplaint.updated_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#737370] uppercase tracking-wider mb-3">Messages & Notes</h3>
                  <div className="bg-white rounded-[10px] border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {isCommentsLoading ? (
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
                            <div className="h-4 bg-[#2a2a2a] rounded w-1/2"></div>
                          </div>
                        </div>
                      ) : activeComments.length === 0 ? (
                        <div className="text-sm text-[#a0a09a] text-center py-4 italic">No messages or notes yet.</div>
                      ) : (
                        activeComments.map(comment => {
                          const isCustomer = comment.user?.role === 'customer';
                          return (
                            <div key={comment.id} className={cn("flex flex-col", isCustomer ? "items-start" : "items-end")}>
                              <div className={cn(
                                "px-4 py-2 max-w-[85%] text-sm rounded-2xl",
                                isCustomer 
                                  ? "bg-[#fafaf7] text-[#0a0a0a] rounded-bl-none border-2 border-slate-200 shadow-sm" 
                                  : comment.is_internal 
                                    ? "bg-amber-500/20 text-amber-200 rounded-br-none border border-amber-500/30"
                                    : "bg-[#3B82F6] text-[#0a0a0a] rounded-br-none"
                              )}>
                                {comment.is_internal && <div className="text-[10px] uppercase font-bold text-amber-500 mb-1">Internal Note</div>}
                                {comment.content}
                              </div>
                              <span className="text-xs text-[#a0a09a] mt-1">
                                {comment.user?.full_name || 'User'} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t-2 border-slate-100 bg-white/80 backdrop-blur-md">
                      <textarea 
                        placeholder="Type a message or internal note..." 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full bg-[#171717] border-2 border-slate-200 shadow-sm rounded-[10px] p-3 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a] min-h-[80px] resize-none mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleSendMessage(true)}
                          disabled={isSendingMessage || !messageText.trim()}
                          className="bg-[#fafaf7] border-2 border-slate-200 shadow-sm hover:bg-[#e0e0da] disabled:opacity-50 text-[#0a0a0a] px-4 py-2 rounded-[10px] text-sm transition-colors"
                        >
                          Add Internal Note
                        </button>
                        <button 
                          onClick={() => handleSendMessage(false)}
                          disabled={isSendingMessage || !messageText.trim()}
                          className="bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-[#0a0a0a] px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
                        >
                          Send to Customer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t-2 border-slate-100 bg-white flex gap-3">
                <select 
                  value=""
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  className="bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a] flex-1"
                >
                  <option value="">Change Status (Current: {selectedComplaint.status})</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#171717] border-2 border-slate-200 shadow-sm rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white">
                  <h2 className="text-xl font-bold text-[#0a0a0a]">Create New Complaint</h2>
                  <button onClick={() => setIsNewModalOpen(false)} className="text-[#737370] hover:text-[#0a0a0a] transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#555550] mb-1">Title</label>
                    <input 
                      {...register('title')} 
                      className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
                      placeholder="Brief summary of the issue"
                    />
                    {errors.title && <p className="text-[#E11D48] text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#555550] mb-1">Customer</label>
                      <select 
                        {...register('customer_id')}
                        className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
                      >
                        <option value="">Select Customer</option>
                        <option value="cust_1">Acme Corp</option>
                        <option value="cust_2">Globex Inc</option>
                      </select>
                      {errors.customer_id && <p className="text-[#E11D48] text-xs mt-1">{errors.customer_id.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555550] mb-1">Department</label>
                      <select 
                        {...register('department_id')}
                        className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
                      >
                        <option value="">Select Department</option>
                        <option value="dept_1">Customer Support</option>
                        <option value="dept_2">Technical Ops</option>
                      </select>
                      {errors.department_id && <p className="text-[#E11D48] text-xs mt-1">{errors.department_id.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555550] mb-1">Category</label>
                      <select 
                        {...register('category')}
                        className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
                      >
                        <option value="">Select Category</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="service">Service</option>
                        <option value="account">Account</option>
                        <option value="security">Security</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && <p className="text-[#E11D48] text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555550] mb-1">Priority</label>
                      <select 
                        {...register('priority')}
                        className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a]"
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      {errors.priority && <p className="text-[#E11D48] text-xs mt-1">{errors.priority.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#555550] mb-1">Description</label>
                    <textarea 
                      {...register('description')}
                      className="w-full bg-white/80 backdrop-blur-md border-2 border-slate-200 shadow-sm rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-[#0a0a0a] min-h-[120px]"
                      placeholder="Provide detailed description of the complaint..."
                    />
                    {errors.description && <p className="text-[#E11D48] text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t-2 border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(false)}
                      className="px-4 py-2 rounded-[10px] text-sm font-medium text-[#555550] hover:bg-[#e0e0da] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-[#0a0a0a] px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
                    >
                      Create Complaint
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
