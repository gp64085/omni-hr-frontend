/**
 * System permission codes mirroring backend PermissionEnum.
 */
export const PERMISSIONS = {
  // Users & Profiles
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",

  // Roles & RBAC
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
  ROLES_DELETE: "roles:delete",

  // Leaves & Holidays
  LEAVE_APPLY: "leave:apply",
  LEAVE_READ: "leave:read",
  LEAVE_APPROVE: "leave:approve",
  LEAVE_MANAGE_TYPES: "leave:manage_types",

  // Projects
  PROJECTS_READ: "projects:read",
  PROJECTS_WRITE: "projects:write",

  // Timesheets
  TIMESHEET_SUBMIT: "timesheet:submit",
  TIMESHEET_APPROVE: "timesheet:approve",

  // Payroll
  PAYROLL_READ: "payroll:read",
  PAYROLL_PROCESS: "payroll:process",

  // Audit
  AUDIT_READ: "audit:read",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
