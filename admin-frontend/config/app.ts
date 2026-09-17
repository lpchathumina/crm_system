export const APP_CONFIG = {
  name: 'Enterprise CRM Admin',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  defaultPerPage: 15,
  plans: [
    { value: 'free', label: 'Free Tier', color: 'slate' },
    { value: 'starter', label: 'Starter', color: 'blue' },
    { value: 'professional', label: 'Professional', color: 'cyan' },
    { value: 'enterprise', label: 'Enterprise', color: 'purple' },
  ],
  roles: [
    { value: 'super-admin', label: 'Super Admin' },
    { value: 'admin', label: 'Administrator' },
    { value: 'viewer', label: 'Viewer / Auditor' },
  ],
  auditActions: [
    { value: '', label: 'All Actions' },
    { value: 'login', label: 'User Login' },
    { value: 'logout', label: 'User Logout' },
    { value: 'organization_create', label: 'Organization Created' },
    { value: 'organization_update', label: 'Organization Updated' },
    { value: 'organization_delete', label: 'Organization Deleted' },
    { value: 'role_create', label: 'Role Created' },
    { value: 'role_update', label: 'Role Updated' },
    { value: 'settings_update', label: 'Settings Updated' },
  ],
};
