export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  timezone: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  users_count?: number;
}

export interface OrganizationStats {
  total_users: number;
  total_customers: number;
  total_deals: number;
  active_tasks: number;
  storage_used_mb: number;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  description: string | null;
  model_type: string | null;
  model_id: number | null;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'boolean' | 'integer' | 'json';
  group: string;
  is_public: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_organizations: number;
  active_organizations: number;
  inactive_organizations: number;
  total_admin_users: number;
  recent_audit_logs: AuditLog[];
  recent_organizations: Organization[];
  plans_distribution: { plan: string; count: number }[];
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
