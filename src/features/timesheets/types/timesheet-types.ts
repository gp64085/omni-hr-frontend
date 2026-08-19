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
  tasks: TimesheetTaskDetail[];
  total_minutes_spent: number;
}

export type ActivitySummaryType = TimesheetProjectAllocation[] | Record<string, unknown>[];

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
  total_minutes_spent: number;
  activity_summary: ActivitySummaryType;
  is_billable?: boolean;
  status: TimesheetStatus;
  approver_id?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyTimesheetSummary {
  start_date: string;
  end_date: string;
  total_minutes_spent: number;
  entries_count: number;
  status_breakdown?: Record<string, number>;
}

export interface TimesheetEntryCreatePayload {
  project_id?: string | null;
  work_date: string;
  total_minutes_spent: number;
  activity_summary: ActivitySummaryType;
}

export interface TimesheetEntryUpdatePayload {
  project_id?: string | null;
  work_date?: string;
  total_minutes_spent?: number;
  activity_summary?: ActivitySummaryType;
}

export interface TimesheetSubmitPayload {
  start_date: string;
  end_date: string;
}

export interface TimesheetStatusUpdatePayload {
  status: "approved" | "rejected" | "submitted" | "draft";
  rejection_reason?: string | null;
}
