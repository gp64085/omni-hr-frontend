export type ProjectStatus = "active" | "completed" | "on_hold";

export interface ProjectDepartment {
  id: string;
  name: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role_in_project?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status?: ProjectStatus;
  is_active: boolean;
  departments?: ProjectDepartment[];
  department_ids?: string[];
  department_id?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  start_date?: string | null;
  end_date?: string | null;
  members?: ProjectMember[];
  created_at: string;
}

export interface ProjectCreatePayload {
  name: string;
  code: string;
  department_ids?: string[];
  is_active?: boolean;
  description?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ProjectUpdatePayload {
  name?: string;
  code?: string;
  department_ids?: string[];
  is_active?: boolean;
  description?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
}
