export interface Customer {
  id: number;
  organization_id: number;
  owner_id: number | null;
  name: string;
  type: 'company' | 'individual';
  industry: string | null;
  status: 'active' | 'lead' | 'churned';
  email: string | null;
  phone: string | null;
  website: string | null;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  annual_revenue: number | null;
  created_at: string;
  contacts?: Contact[];
  deals?: Deal[];
  tasks?: Task[];
  activities?: Activity[];
  notes?: Note[];
}

export interface Contact {
  id: number;
  customer_id: number | null;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  is_primary: boolean;
  created_at: string;
  customer?: Customer;
}

export interface Lead {
  id: number;
  organization_id: number;
  customer_id: number | null;
  owner_id: number | null;
  title: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  description: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  source: string | null;
  estimated_value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  created_at: string;
  customer?: Customer;
}

export interface Deal {
  id: number;
  organization_id: number;
  customer_id: number;
  contact_id: number | null;
  owner_id: number | null;
  name: string;
  amount: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number | null;
  expected_close_date: string | null;
  closed_at: string | null;
  status: 'open' | 'won' | 'lost';
  notes?: string;
  created_at: string;
  customer?: Customer;
  contact?: Contact;
}

export interface Task {
  id: number;
  organization_id: number;
  customer_id: number | null;
  assigned_to: number | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
  customer?: Customer;
}

export interface Activity {
  id: number;
  organization_id: number;
  user_id: number | null;
  type: 'call' | 'meeting' | 'email' | 'note' | 'task' | 'other';
  title: string;
  description: string | null;
  performed_at: string;
  duration_minutes: number | null;
  subject_type: string | null;
  subject_id: number | null;
  created_at: string;
  user?: { id: number; name: string };
  causer?: { id: number; name: string };
}

export interface Note {
  id: number;
  body: string;
  noteable_type: string;
  noteable_id: number;
  author_id: number | null;
  created_at: string;
  author?: { id: number; name: string };
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_customers: number;
  total_contacts: number;
  total_leads: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  pipeline_value: number;
  won_revenue: number;
  win_rate: number;
  pending_tasks: number;
  overdue_tasks: number;
  conversion_rate: number;
}

export interface PipelineSummary {
  stage: string;
  count: number;
  total_value: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}
