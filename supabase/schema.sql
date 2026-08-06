-- ============================================================
-- NEXUS AI CRM — Supabase Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'support', 'customer');
CREATE TYPE complaint_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened');
CREATE TYPE complaint_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE complaint_category AS ENUM ('billing', 'technical', 'service', 'account', 'security', 'other');
CREATE TYPE notification_type AS ENUM ('complaint_update', 'assignment', 'sla_alert', 'ai_alert', 'system');
CREATE TYPE sentiment_type AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  company TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_user_id UUID REFERENCES public.users(id),
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers (profile for customer-role users)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT,
  phone TEXT,
  address TEXT,
  satisfaction_score NUMERIC(3,1) DEFAULT 0,
  total_complaints INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employees (profile for staff-role users)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  job_title TEXT,
  workload INTEGER DEFAULT 0,
  avg_resolution_hours NUMERIC(5,1) DEFAULT 0,
  performance_score NUMERIC(3,1) DEFAULT 0,
  total_resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  assigned_to UUID REFERENCES public.employees(id),
  department_id UUID REFERENCES public.departments(id),
  category complaint_category NOT NULL DEFAULT 'other',
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'open',
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  ai_processed BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Complaint History (timeline/audit trail)
CREATE TABLE public.complaint_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attachments
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments / Notes
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Analysis Results
CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
  input_text TEXT,
  summary TEXT,
  sentiment sentiment_type,
  sentiment_score NUMERIC(3,2),
  predicted_priority complaint_priority,
  predicted_category complaint_category,
  predicted_department TEXT,
  suggested_employee TEXT,
  suggested_reply TEXT,
  root_cause TEXT,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  duplicate_ids UUID[],
  confidence NUMERIC(3,2),
  model TEXT DEFAULT 'gemini-pro',
  processing_time_ms INTEGER,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity Logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_complaints_customer ON public.complaints(customer_id);
CREATE INDEX idx_complaints_assigned ON public.complaints(assigned_to);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_department ON public.complaints(department_id);
CREATE INDEX idx_complaints_created ON public.complaints(created_at DESC);
CREATE INDEX idx_complaints_sla ON public.complaints(sla_deadline) WHERE sla_breached = false;

CREATE INDEX idx_complaint_history_complaint ON public.complaint_history(complaint_id);
CREATE INDEX idx_comments_complaint ON public.comments(complaint_id);
CREATE INDEX idx_attachments_complaint ON public.attachments(complaint_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_ai_analysis_complaint ON public.ai_analysis(complaint_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users: staff see all, customers see themselves
CREATE POLICY "Staff can view all users" ON public.users
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Departments: everyone can read
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Customers: staff see all, customers see own
CREATE POLICY "Staff can view all customers" ON public.customers
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Customers can view own profile" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile" ON public.customers
  FOR UPDATE USING (user_id = auth.uid());

-- Complaints: staff see all, customers see own
CREATE POLICY "Staff can view all complaints" ON public.complaints
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Staff can manage complaints" ON public.complaints
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Customers can view own complaints" ON public.complaints
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Customers can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Complaint History: follows complaint visibility
CREATE POLICY "Staff can view all history" ON public.complaint_history
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Customers can view own complaint history" ON public.complaint_history
  FOR SELECT USING (
    complaint_id IN (
      SELECT c.id FROM public.complaints c
      JOIN public.customers cu ON c.customer_id = cu.id
      WHERE cu.user_id = auth.uid()
    )
  );

-- Comments: staff see all, customers see non-internal on own complaints
CREATE POLICY "Staff can manage comments" ON public.comments
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Customers can view public comments on own complaints" ON public.comments
  FOR SELECT USING (
    is_internal = false AND
    complaint_id IN (
      SELECT c.id FROM public.complaints c
      JOIN public.customers cu ON c.customer_id = cu.id
      WHERE cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can add comments to own complaints" ON public.comments
  FOR INSERT WITH CHECK (
    is_internal = false AND
    complaint_id IN (
      SELECT c.id FROM public.complaints c
      JOIN public.customers cu ON c.customer_id = cu.id
      WHERE cu.user_id = auth.uid()
    )
  );

-- Attachments: follows complaint visibility
CREATE POLICY "Staff can manage attachments" ON public.attachments
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Customers can view own attachments" ON public.attachments
  FOR SELECT USING (
    complaint_id IN (
      SELECT c.id FROM public.complaints c
      JOIN public.customers cu ON c.customer_id = cu.id
      WHERE cu.user_id = auth.uid()
    )
  );

-- Notifications: users see own
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- AI Analysis: staff only
CREATE POLICY "Staff can manage AI analysis" ON public.ai_analysis
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

-- Activity Logs: admins only
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Employees: staff see all
CREATE POLICY "Staff can view employees" ON public.employees
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'support')
  );

CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_employees
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_complaints
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate complaint number
CREATE OR REPLACE FUNCTION public.generate_complaint_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(complaint_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.complaints;
  
  NEW.complaint_number = 'NXC-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_complaint_number
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.complaint_number IS NULL OR NEW.complaint_number = '')
  EXECUTE FUNCTION public.generate_complaint_number();

-- Auto-set SLA deadline (24h for critical, 48h for high, 72h for medium, 1 week for low)
CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_deadline IS NULL THEN
    CASE NEW.priority
      WHEN 'critical' THEN NEW.sla_deadline = now() + INTERVAL '24 hours';
      WHEN 'high' THEN NEW.sla_deadline = now() + INTERVAL '48 hours';
      WHEN 'medium' THEN NEW.sla_deadline = now() + INTERVAL '72 hours';
      WHEN 'low' THEN NEW.sla_deadline = now() + INTERVAL '7 days';
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sla_on_insert
  BEFORE INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_sla_deadline();

-- Auto-log complaint status changes
CREATE OR REPLACE FUNCTION public.log_complaint_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.complaint_history (complaint_id, action, old_value, new_value, performed_by)
    VALUES (NEW.id, 'status_change', OLD.status::TEXT, NEW.status::TEXT, auth.uid());
  END IF;
  
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.complaint_history (complaint_id, action, old_value, new_value, performed_by)
    VALUES (NEW.id, 'priority_change', OLD.priority::TEXT, NEW.priority::TEXT, auth.uid());
  END IF;
  
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.complaint_history (complaint_id, action, old_value, new_value, performed_by)
    VALUES (NEW.id, 'assignment_change', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT, auth.uid());
  END IF;
  
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_complaint_changes
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.log_complaint_change();

-- ============================================================
-- SEED DATA — Departments
-- ============================================================

INSERT INTO public.departments (name, description, color) VALUES
  ('Engineering', 'Technical and engineering support', '#3b82f6'),
  ('Billing', 'Payment and billing issues', '#e11d48'),
  ('Customer Success', 'Customer onboarding and success', '#74d8bd'),
  ('Security', 'Security and compliance', '#f59e0b'),
  ('Sales', 'Sales and account management', '#8b5cf6');

-- ============================================================
-- STORAGE BUCKET for attachments
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Anyone can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');
