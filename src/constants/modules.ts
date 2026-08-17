/**
 * Recognized system modules for filtering, auditing, and role groupings.
 */
export const SYSTEM_MODULES = [
  "all",
  "auth",
  "users",
  "roles",
  "leave",
  "payroll",
  "timesheet",
  "projects",
  "audit",
] as const;

export type SystemModule = (typeof SYSTEM_MODULES)[number];
