export const CRM_CONFIG = {
  name: 'Enterprise CRM',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002',
  defaultPerPage: 15,
  pipelineStages: [
    { id: 'prospecting', name: 'Prospecting', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { id: 'qualification', name: 'Qualification', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
    { id: 'proposal', name: 'Proposal', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { id: 'negotiation', name: 'Negotiation', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { id: 'closed_won', name: 'Closed Won', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { id: 'closed_lost', name: 'Closed Lost', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
  ],
  leadStatuses: [
    { value: 'new', label: 'New Prospect' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'unqualified', label: 'Unqualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' },
  ],
  taskPriorities: [
    { value: 'low', label: 'Low', color: 'slate' },
    { value: 'medium', label: 'Medium', color: 'cyan' },
    { value: 'high', label: 'High', color: 'amber' },
    { value: 'urgent', label: 'Urgent', color: 'rose' },
  ],
  activityTypes: [
    { value: 'call', label: 'Phone Call' },
    { value: 'meeting', label: 'Meeting / Demo' },
    { value: 'email', label: 'Email Interaction' },
    { value: 'note', label: 'Internal Note' },
  ],
};
