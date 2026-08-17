export type UserRole = string;

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

export interface DepartmentInfo {
  id: string;
  name: string;
}

export interface DesignationInfo {
  id: string;
  title: string;
}

export interface UserProfileData {
  id?: string;
  phone_number?: string | null;
  emergency_contact?: string | null;
  address?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  ifsc_swift_code?: string | null;
  pan_ssn?: string | null;
  joining_date?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id?: string | null;
  role?: Role | null;
  is_active: boolean;
  department?: DepartmentInfo | null;
  designation?: DesignationInfo | null;
  manager_id?: string | null;
  profile?: UserProfileData | null;
  created_at: string;
}
