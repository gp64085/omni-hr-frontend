export type NotificationType =
  | "leave_request"
  | "leave_approval"
  | "leave_rejection"
  | "timesheet_submission"
  | "timesheet_approval"
  | "timesheet_rejection"
  | "general";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}
