export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimesheetTaskDetail {
  summary: string;
  hours: number;
  minutes?: number;
  formatted_time?: string;
}

export interface TimesheetProjectAllocation {
  project_id?: string | null;
  project_name?: string | null;
  is_billable?: boolean;
  tasks: TimesheetTaskDetail[];
  total_hours?: number;
}

export type ActivitySummaryType =
  string | TimesheetProjectAllocation[] | TimesheetTaskDetail[] | Record<string, unknown>[];

export interface TimesheetEntry {
  id: string;
  user_id: string;
  user_name?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  project?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  work_date: string;
  hours_spent: number;
  activity_summary: ActivitySummaryType;
  is_billable: boolean;
  status: TimesheetStatus;
  approver_id?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyTimesheetSummary {
  start_date: string;
  end_date: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  entries_count: number;
  status_breakdown?: Record<string, number>;
}

export interface TimesheetEntryCreatePayload {
  project_id?: string | null;
  work_date: string;
  hours_spent?: number;
  activity_summary: ActivitySummaryType;
  is_billable?: boolean;
}

export interface TimesheetEntryUpdatePayload {
  project_id?: string | null;
  work_date?: string;
  hours_spent?: number;
  activity_summary?: ActivitySummaryType;
  is_billable?: boolean;
}

export interface TimesheetSubmitPayload {
  start_date: string;
  end_date: string;
}

export interface TimesheetStatusUpdatePayload {
  status: "approved" | "rejected" | "submitted" | "draft";
  rejection_reason?: string | null;
}
