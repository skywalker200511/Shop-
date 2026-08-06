import { mockComplaints, mockDashboardMetrics, mockChartData, mockNotifications } from '../data/mockData';
import { sleep } from '../lib/utils';
import { analyzeComplaint } from '../lib/gemini';
import type { Complaint, DashboardMetrics, ChartDataPoint, Notification } from '@/types';

export const mockService = {
  async getAllComplaints(): Promise<Complaint[]> {
    await sleep(500);
    return mockComplaints;
  },

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    await sleep(300);
    return mockComplaints.find(c => c.id === id);
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await sleep(400);
    return mockDashboardMetrics;
  },

  async getChartData(): Promise<ChartDataPoint[]> {
    await sleep(400);
    return mockChartData;
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    await sleep(300);
    return mockNotifications.filter(n => n.user_id === userId);
  },

  async analyzeComplaintAI(text: string) {
    return analyzeComplaint(text);
  },

  async createComplaint(complaintData: Partial<Complaint>): Promise<Complaint> {
    await sleep(500);
    const newComplaint: Complaint = {
      id: `c_${Date.now()}`,
      complaint_number: `CMP-${Math.floor(Math.random() * 10000)}`,
      title: complaintData.title || '',
      description: complaintData.description || '',
      customer_id: complaintData.customer_id || 'cust_1',
      department_id: complaintData.department_id || 'dept_1',
      category: complaintData.category as any,
      priority: complaintData.priority as any,
      status: 'open' as any,
      sla_deadline: new Date(Date.now() + 86400000).toISOString(),
      sla_breached: false,
      ai_processed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockComplaints.unshift(newComplaint);
    return newComplaint;
  }
};
