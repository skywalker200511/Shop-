import { supabase } from '@/lib/supabase';
import type { Complaint, Customer, Department, Employee, AIAnalysis } from '@/types';

export const supabaseService = {
  // Complaints
  async getAllComplaints(filters?: { status?: string; priority?: string; category?: string }): Promise<Complaint[]> {
    let query = supabase
      .from('complaints')
      .select(`
        *,
        customer:customers(*, user:users(*)),
        department:departments(*),
        assignee:employees(*, user:users(*))
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase());
    }
    if (filters?.priority && filters.priority !== 'All') {
      query = query.eq('priority', filters.priority.toLowerCase());
    }
    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category.toLowerCase());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Complaint[];
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        customer:customers(*, user:users(*)),
        department:departments(*),
        assignee:employees(*, user:users(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Complaint;
  },

  async getCustomerComplaints(): Promise<Complaint[]> {
    // Note: RLS ensures customers only see their own complaints
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        customer:customers(*, user:users(*)),
        department:departments(*)
      `)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data as Complaint[];
  },

  async createComplaint(complaint: Partial<Complaint>): Promise<Complaint> {
    const payload = { ...complaint };
    
    // Assign a default department if missing
    if (!payload.department_id) {
      const { data: depts } = await supabase.from('departments').select('id').limit(1);
      if (depts && depts.length > 0) {
        payload.department_id = depts[0].id;
      }
    }
    
    // Assign a default complaint number if missing
    if (!payload.complaint_number) {
      payload.complaint_number = 'CMP-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data as Complaint;
  },

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Complaint;
  },

  async deleteComplaint(id: string): Promise<void> {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  // Users & Profiles
  async getCustomerProfile(userId: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // 0 rows returned, let's create a profile for them
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          user_id: userId,
          company: 'N/A',
          phone: 'N/A',
          total_complaints: 0
        })
        .select('*, user:users(*)')
        .single();
        
      if (insertError) throw insertError;
      return newCustomer as Customer;
    } else if (error) {
      throw error;
    }
    
    return data as Customer;
  },

  // Dashboard Stats
  async getAdminDashboardMetrics() {
    const { count: totalCount, error: totalError } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true });
      
    const { count: breachCount, error: breachError } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('sla_breached', true);

    const { data: resolvedData } = await supabase
      .from('complaints')
      .select('created_at, closed_at')
      .eq('status', 'closed')
      .not('closed_at', 'is', null);

    let avgRes = 0;
    if (resolvedData && resolvedData.length > 0) {
      const totalHours = resolvedData.reduce((acc, curr) => {
        const start = new Date(curr.created_at).getTime();
        const end = new Date(curr.closed_at).getTime();
        return acc + ((end - start) / (1000 * 60 * 60));
      }, 0);
      avgRes = totalHours / resolvedData.length;
    }

    return {
      total_complaints: totalCount || 0,
      sla_breaches: breachCount || 0,
      ai_accuracy: 98.4, // Keep this mock for now as it requires complex evaluation logic
      avg_resolution_hours: avgRes
    };
  },

  async getCustomerDashboardMetrics(customerId: string) {
    const { count: openCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .not('status', 'in', '("resolved","closed")');

    const { count: resolvedCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'resolved');

    return {
      openComplaints: openCount || 0,
      resolvedThisMonth: resolvedCount || 0,
      avgResponseTime: 'N/A',
      satisfactionScore: 'N/A'
    };
  },

  async getWeeklyVolumeData() {
    const { data, error } = await supabase
      .from('complaints')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
    if (error) throw error;
    
    // Group by day of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    data?.forEach(complaint => {
      const date = new Date(complaint.created_at);
      counts[date.getDay()]++;
    });
    
    // Format for Recharts, starting from Monday to Sunday
    return [
      { name: 'Mon', value: counts[1] },
      { name: 'Tue', value: counts[2] },
      { name: 'Wed', value: counts[3] },
      { name: 'Thu', value: counts[4] },
      { name: 'Fri', value: counts[5] },
      { name: 'Sat', value: counts[6] },
      { name: 'Sun', value: counts[0] }
    ];
  },
  
  async analyzeComplaintAI(text: string) {
    return null; // Implemented in actual component or edge function
  }
};
