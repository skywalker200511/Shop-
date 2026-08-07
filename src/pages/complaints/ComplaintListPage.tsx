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
  FileText,
  Trash2
} from 'lucide-react';

import type { Complaint, Comment, Customer, Department } from '@/types';
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

  const handleDelete = async () => {
    if (!selectedComplaint) return;
    if (!window.confirm(`Are you sure you want to delete complaint ${selectedComplaint.complaint_number}? This action cannot be undone.`)) return;
    
    setIsUpdating(true);
    try {
      await supabaseService.deleteComplaint(selectedComplaint.id);
      setData(data.filter(c => c.id !== selectedComplaint.id));
      setSelectedComplaint(null);
      toast.success('Complaint deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete complaint: ${error?.message || 'Unknown error'}`);
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (isNewModalOpen) {
      supabaseService.getCustomers().then(setAvailableCustomers).catch(console.error);
      supabaseService.getDepartments().then(setAvailableDepartments).catch(console.error);
    }
  }, [isNewModalOpen]);

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
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Complaint # <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="font-mono text-sm text-[#e5bdbe]">{info.getValue()}</span>
    },
    {
      accessorKey: 'title',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="font-medium text-white">{info.getValue()}</span>
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-gray-300">{row.customer?.company || row.customer?.user?.full_name || row.customer_id}</span>
      }
    },
    {
      accessorKey: 'priority',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Priority <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <PriorityBadge priority={info.getValue()} />
    },
    {
      accessorKey: 'status',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Status <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <StatusBadge status={info.getValue()} />
    },
    {
      accessorKey: 'category',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Category <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-gray-300 capitalize">{row.category.replace('_', ' ')}</span>
      }
    },
    {
      accessorKey: 'department_id',
      header: 'Department',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-gray-300 capitalize">{row.department?.name || row.department_id}</span>
      }
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: (info: any) => <span className="text-gray-300">{info.getValue()}</span>
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: any) => (
        <div className="flex items-center cursor-pointer hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: (info: any) => <span className="text-gray-300">{formatDate(info.getValue())}</span>
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

  const exportToPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-toast" });
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text("Complaints Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      const tableColumn = ["ID", "Title", "Customer", "Category", "Priority", "Status", "Date"];
      const tableRows: any[] = [];
      
      const complaintsToExport = table.getRowModel().rows.map((row: any) => row.original);
      
      complaintsToExport.forEach((complaint: any) => {
        const complaintData = [
          complaint.complaint_number,
          complaint.title.length > 30 ? complaint.title.substring(0, 30) + '...' : complaint.title,
          complaint.customer?.user?.full_name || 'Unknown',
          complaint.category,
          complaint.priority,
          complaint.status,
          formatDate(complaint.created_at)
        ];
        tableRows.push(complaintData);
      });
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [225, 29, 72] }
      });
      
      doc.save(`complaints_report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exported successfully", { id: "pdf-toast" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF", { id: "pdf-toast" });
    }
  };

  return (
    <div className="p-6 w-full min-w-0 max-w-[1600px] mx-auto min-h-[calc(100vh-2rem)] my-4 bg-[#090909] text-white font-inter rounded-[24px] shadow-2xl">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-white"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-[#090909] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-white"
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
              className="bg-[#090909] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-white"
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
              className="bg-[#090909] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-white"
            >
              <option value="All">All Categories</option>
              <option value="delivery">Delivery</option>
              <option value="refund">Refund</option>
              <option value="product_related">Product Related</option>
              <option value="billing">Billing</option>
              <option value="service">Service</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm px-3 py-2"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="bg-[#1f1f1f] border border-[#2a2a2a] hover:bg-[#2a2a2a] text-white px-3 py-2 rounded-[10px] flex items-center gap-2 transition-colors text-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-[#1f1f1f] border border-[#2a2a2a] hover:bg-[#2a2a2a] text-white px-3 py-2 rounded-[10px] flex items-center gap-2 transition-colors text-sm"
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
            action={<button onClick={clearFilters} className="bg-surface-variant hover:bg-surface-variant-highest text-white px-4 py-2 rounded-md font-medium text-sm">Clear Filters</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <tr key={headerGroup.id} className="border-b border-[#2a2a2a] bg-[#121212]">
                    {headerGroup.headers.map((header: any) => (
                      <th key={header.id} className="p-4 font-semibold text-gray-400 text-sm whitespace-nowrap">
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
                    className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f] cursor-pointer transition-colors"
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
          <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of{' '}
              {filteredData.length} entries
            </div>
            <div className="flex items-center gap-4">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-[#090909] border border-[#2a2a2a] rounded-[10px] px-2 py-1 text-sm focus:outline-none focus:border-[#E11D48] text-white"
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
                  className="p-1 rounded bg-[#1f1f1f] border border-[#2a2a2a] disabled:opacity-50 text-white hover:bg-[#2a2a2a] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1 rounded bg-[#1f1f1f] border border-[#2a2a2a] disabled:opacity-50 text-white hover:bg-[#2a2a2a] transition-colors"
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
              className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-[#171717] border-l border-[#2a2a2a] z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#2a2a2a] px-2 py-1 rounded text-xs font-mono text-[#e5bdbe]">
                      {selectedComplaint.complaint_number}
                    </span>
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h3>
                  <div className="bg-[#121212] rounded-[10px] border border-[#2a2a2a] p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Company</div>
                        <div className="font-medium">{selectedComplaint.customer?.company || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Contact</div>
                        <div className="font-medium">{selectedComplaint.customer?.user?.full_name || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-[#3B82F6]">{selectedComplaint.customer?.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                  <div className="bg-[#121212] rounded-[10px] border border-[#2a2a2a] p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </div>
                </div>

                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Attachments</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedComplaint.attachments.map(att => (
                        <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="group block relative rounded-[10px] overflow-hidden border border-[#2a2a2a] hover:border-[#E11D48] transition-colors">
                          <img src={att.file_url} alt={att.file_name} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-medium">View File</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
                  <div className="bg-[#121212] rounded-[10px] border border-[#2a2a2a] p-4 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-2 bg-[#74D8BD] rounded-full my-1"></div>
                      <div>
                        <div className="text-sm font-medium">Complaint Created</div>
                        <div className="text-xs text-gray-500">{formatDate(selectedComplaint.created_at)}</div>
                      </div>
                    </div>
                    {selectedComplaint.updated_at !== selectedComplaint.created_at && (
                      <div className="flex gap-4">
                        <div className="w-2 bg-[#3B82F6] rounded-full my-1"></div>
                        <div>
                          <div className="text-sm font-medium">Last Updated</div>
                          <div className="text-xs text-gray-500">{formatDate(selectedComplaint.updated_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Messages & Notes</h3>
                  <div className="bg-[#121212] rounded-[10px] border border-[#2a2a2a] overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {isCommentsLoading ? (
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
                            <div className="h-4 bg-[#2a2a2a] rounded w-1/2"></div>
                          </div>
                        </div>
                      ) : activeComments.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-4 italic">No messages or notes yet.</div>
                      ) : (
                        activeComments.map(comment => {
                          const isCustomer = comment.user?.role === 'customer';
                          return (
                            <div key={comment.id} className={cn("flex flex-col", isCustomer ? "items-start" : "items-end")}>
                              <div className={cn(
                                "px-4 py-2 max-w-[85%] text-sm rounded-2xl",
                                isCustomer 
                                  ? "bg-[#1f1f1f] text-white rounded-bl-none border border-[#2a2a2a]" 
                                  : comment.is_internal 
                                    ? "bg-amber-500/20 text-amber-200 rounded-br-none border border-amber-500/30"
                                    : "bg-[#3B82F6] text-white rounded-br-none"
                              )}>
                                {comment.is_internal && <div className="text-[10px] uppercase font-bold text-amber-500 mb-1">Internal Note</div>}
                                {comment.content}
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {comment.user?.full_name || 'User'} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t border-[#2a2a2a] bg-[#090909]">
                      <textarea 
                        placeholder="Type a message or internal note..." 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full bg-[#171717] border border-[#2a2a2a] rounded-[10px] p-3 text-sm focus:outline-none focus:border-[#E11D48] text-white min-h-[80px] resize-none mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleSendMessage(true)}
                          disabled={isSendingMessage || !messageText.trim()}
                          className="bg-[#1f1f1f] border border-[#2a2a2a] hover:bg-[#2a2a2a] disabled:opacity-50 text-white px-4 py-2 rounded-[10px] text-sm transition-colors"
                        >
                          Add Internal Note
                        </button>
                        <button 
                          onClick={() => handleSendMessage(false)}
                          disabled={isSendingMessage || !messageText.trim()}
                          className="bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
                        >
                          Send to Customer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#2a2a2a] bg-[#121212] flex gap-3">
                <select 
                  value=""
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  className="bg-[#090909] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48] text-white flex-1"
                >
                  <option value="">Change Status (Current: {selectedComplaint.status})</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                {user?.role === 'admin' && (
                  <button
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-[10px] px-4 py-2 transition-colors flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap"
                    title="Delete Complaint"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
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
                className="bg-[#171717] border border-[#2a2a2a] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center bg-[#121212]">
                  <h2 className="text-xl font-bold text-white">Create New Complaint</h2>
                  <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input 
                      {...register('title')} 
                      className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white"
                      placeholder="Brief summary of the issue"
                    />
                    {errors.title && <p className="text-[#E11D48] text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
                        <select 
                          {...register('customer_id')}
                          className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white"
                        >
                          <option value="">Select Customer</option>
                          {availableCustomers.map(c => (
                            <option key={c.id} value={c.id}>{c.company} - {c.user?.full_name}</option>
                          ))}
                        </select>
                        {errors.customer_id && <p className="text-[#E11D48] text-xs mt-1">{errors.customer_id.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                        <select 
                          {...register('department_id')}
                          className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white"
                        >
                          <option value="">Select Department</option>
                          {availableDepartments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        {errors.department_id && <p className="text-[#E11D48] text-xs mt-1">{errors.department_id.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                      <select 
                        {...register('category')}
                        className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white"
                      >
                        <option value="">Select Category</option>
                        <option value="delivery">Delivery</option>
                        <option value="refund">Refund</option>
                        <option value="product_related">Product Related</option>
                        <option value="billing">Billing</option>
                        <option value="service">Service</option>
                        <option value="account">Account</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && <p className="text-[#E11D48] text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                      <select 
                        {...register('priority')}
                        className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea 
                      {...register('description')}
                      className="w-full bg-[#090909] border border-[#2a2a2a] rounded-[10px] p-2.5 text-sm focus:outline-none focus:border-[#E11D48] text-white min-h-[120px]"
                      placeholder="Provide detailed description of the complaint..."
                    />
                    {errors.description && <p className="text-[#E11D48] text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-[#2a2a2a] mt-6">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(false)}
                      className="px-4 py-2 rounded-[10px] text-sm font-medium text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
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
