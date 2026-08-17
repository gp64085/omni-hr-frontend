export interface Department {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  title: string;
}

export interface ProfileUpdatePayload {
  phone_number?: string;
  emergency_contact?: string;
  address?: string;
  bank_account_number?: string;
  bank_name?: string;
  ifsc_swift_code?: string;
  pan_ssn?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  role_id?: string;
  role_name?: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id?: string;
  department_id?: string;
  designation_id?: string;
  manager_id?: string;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  role_id?: string;
  department_id?: string;
  designation_id?: string;
  manager_id?: string;
  is_active?: boolean;
}
