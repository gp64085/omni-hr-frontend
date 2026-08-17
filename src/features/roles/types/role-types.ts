export interface Permission {
  id: string;
  code: string;
  module: string;
  description?: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  permission_ids?: string[];
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
  permission_ids: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export interface PermissionCreatePayload {
  code: string;
  module: string;
  description?: string;
}
