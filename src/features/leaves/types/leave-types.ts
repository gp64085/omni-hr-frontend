export type LeaveTypeEnum = "casual" | "sick" | "earned" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveType {
  id: string;
  name: string;
  default_quota: number;
  requires_approval: boolean;
  auto_approve_threshold: number;
  created_at: string;
}

export interface LeaveAllocation {
  id: string;
  user_id: string;
  leave_type_id: string;
  leave_type: LeaveType;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  scheduled_future_days?: number;
}

export interface LeaveRequestUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LeaveDayItem {
  date: string;
  day_status: LeaveStatus;
  total_days: number;
  half_day_type?: string;
  settled?: boolean;
  paid_days?: number;
  lwp_days?: number;
  rejection_reason?: string | null;
  timesheet_override?: boolean;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user?: LeaveRequestUser;
  leave_type_id: string;
  leave_type?: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  is_half_day: boolean;
  half_day_session?: "first_half" | "second_half" | null;
  status: LeaveStatus;
  approver_id?: string | null;
  approver_comments?: string | null;
  extra_metadata?: {
    paid_days?: number;
    lwp_days?: number;
    auto_lwp_applied?: boolean;
    settled?: boolean;
    settled_at?: string;
    partial_decision?: boolean;
    days?: LeaveDayItem[];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  holiday_date: string;
  is_recurring: boolean;
  year?: number;
  created_at: string;
}

export interface LeaveRequestCreatePayload {
  leave_type_id?: string;
  start_date: string;
  end_date: string;
  reason?: string;
  is_half_day?: boolean;
  half_day_session?: "first_half" | "second_half" | null;
}

export interface LeaveStatusUpdatePayload {
  status: "approved" | "rejected";
  comments?: string;
  rejection_reason?: string;
  approved_dates?: string[];
  rejected_dates?: string[];
}

export interface LeavePolicy {
  id: string;
  role_id: string;
  leave_type_id: string;
  accrual_frequency: "monthly" | "quarterly" | "half_yearly" | "yearly" | "manual";
  days_per_period: number;
  max_carry_forward_days: number;
  encashable: boolean;
  created_at: string;
}
