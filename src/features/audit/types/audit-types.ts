export interface AuditLog {
  id: string;
  user_id?: string | null;
  module: string;
  entity: string;
  action: string;
  ip_address?: string | null;
  user_agent?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  module?: string;
  entity?: string;
  action?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}
