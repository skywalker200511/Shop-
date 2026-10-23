import { UserRole, ComplaintStatus, ComplaintPriority, ComplaintCategory, SentimentType, NotificationType } from '@/types';
import type { User, Customer, Department, Employee, Complaint, AIAnalysis, DashboardMetrics, ChartDataPoint, Notification } from '@/types';
import { generateId } from '@/lib/utils';

export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@shopplus.com', full_name: 'Admin User', role: UserRole.Admin, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'u2', email: 'support@shopplus.com', full_name: 'Support Agent', role: UserRole.Support, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'u3', email: 'john@customer.co', full_name: 'John Doe', role: UserRole.Customer, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Technical Support', description: 'Handles all technical issues', color: '#3B82F6' },
  { id: 'd2', name: 'Billing', description: 'Handles payment issues', color: '#10B981' },
  { id: 'd3', name: 'Customer Service', description: 'General inquiries', color: '#F59E0B' },
  { id: 'd4', name: 'Security', description: 'Security related issues', color: '#EF4444' },
  { id: 'd5', name: 'Account Management', description: 'Account related inquiries', color: '#8B5CF6' }
];

export const mockCustomers: Customer[] = [
  { id: 'c1', user_id: 'u3', company: 'Acme Corp', phone: '+1234567890', total_complaints: 5, created_at: new Date().toISOString() }
];

export const mockEmployees: Employee[] = [
  { id: 'e1', user_id: 'u2', department_id: 'd1', job_title: 'Senior Support Agent', workload: 80, avg_resolution_hours: 4.5, performance_score: 95, total_resolved: 450 }
];

export const mockComplaints: Complaint[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `comp-${i}`,
  complaint_number: `REQ-${1000 + i}`,
  title: `Issue with ${['login', 'billing', 'service', 'performance'][i % 4]}`,
  description: `Customer is experiencing issues with ${['login', 'billing', 'service', 'performance'][i % 4]}. Needs urgent attention.`,
  customer_id: 'c1',
  department_id: `d${(i % 5) + 1}`,
  category: Object.values(ComplaintCategory)[i % Object.values(ComplaintCategory).length],
  priority: Object.values(ComplaintPriority)[i % Object.values(ComplaintPriority).length],
  status: Object.values(ComplaintStatus)[i % Object.values(ComplaintStatus).length],
  sla_deadline: new Date(Date.now() + 86400000).toISOString(),
  sla_breached: i % 7 === 0,
  ai_processed: true,
  created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
  updated_at: new Date().toISOString(),
}));

export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'u1', type: NotificationType.NewComplaint, title: 'New Complaint', message: 'A new high priority complaint was logged.', read: false, created_at: new Date().toISOString() }
];

export const mockDashboardMetrics: DashboardMetrics = {
  total_complaints: 1492,
  open_complaints: 124,
  resolved_today: 45,
  avg_resolution_time: 4.2,
  sla_breaches: 24,
  customer_satisfaction: 4.8,
  ai_accuracy: 98.4
};

export const mockChartData: ChartDataPoint[] = [
  { label: 'Mon', value: 80 },
  { label: 'Tue', value: 90 },
  { label: 'Wed', value: 100 },
  { label: 'Thu', value: 120 },
  { label: 'Fri', value: 180 },
  { label: 'Sat', value: 280 },
  { label: 'Sun', value: 350 },
];
