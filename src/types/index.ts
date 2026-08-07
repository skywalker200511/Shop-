export const UserRole = {
  Admin: 'admin',
  Manager: 'manager',
  Support: 'support',
  Customer: 'customer'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ComplaintStatus = {
  Open: 'open',
  Assigned: 'assigned',
  InProgress: 'in_progress',
  Resolved: 'resolved',
  Closed: 'closed',
  Reopened: 'reopened'
} as const;
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

export const ComplaintPriority = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low'
} as const;
export type ComplaintPriority = typeof ComplaintPriority[keyof typeof ComplaintPriority];

export const ComplaintCategory = {
  Delivery: 'delivery',
  Refund: 'refund',
  Product: 'product_related',
  Billing: 'billing',
  Service: 'service',
  Account: 'account',
  Other: 'other'
} as const;
export type ComplaintCategory = typeof ComplaintCategory[keyof typeof ComplaintCategory];

export const SentimentType = {
  VeryNegative: 'very_negative',
  Negative: 'negative',
  Neutral: 'neutral',
  Positive: 'positive',
  VeryPositive: 'very_positive'
} as const;
export type SentimentType = typeof SentimentType[keyof typeof SentimentType];

export const NotificationType = {
  NewComplaint: 'new_complaint',
  StatusUpdate: 'status_update',
  MessageReceived: 'message_received',
  SlaBreach: 'sla_breach',
  Assignment: 'assignment'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  company?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  user?: User;
  company: string;
  phone: string;
  address?: string;
  satisfaction_score?: number;
  total_complaints: number;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  user?: User;
  department_id: string;
  department?: Department;
  job_title: string;
  workload: number;
  avg_resolution_hours: number;
  performance_score: number;
  total_resolved: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head_user_id?: string;
  color: string;
}

export interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  customer_id: string;
  customer?: Customer;
  assigned_to?: string;
  assignee?: Employee;
  department_id: string;
  department?: Department;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  sla_deadline: string;
  sla_breached: boolean;
  ai_processed: boolean;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  changed_by: string;
  field_changed: string;
  old_value?: string;
  new_value: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  complaint_id: string;
  user_id: string;
  user?: User;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  complaint_id: string;
  input_text: string;
  summary: string;
  sentiment: SentimentType;
  sentiment_score: number;
  predicted_priority: ComplaintPriority;
  predicted_category: ComplaintCategory;
  predicted_department: string;
  suggested_employee?: string;
  suggested_reply: string;
  root_cause: string;
  risk_score: number;
  duplicate_ids?: string[];
  confidence: number;
  model: string;
  processing_time_ms: number;
  created_by: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export interface DashboardMetrics {
  total_complaints: number;
  open_complaints: number;
  resolved_today: number;
  avg_resolution_time: number;
  sla_breaches: number;
  customer_satisfaction: number;
  ai_accuracy: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}
