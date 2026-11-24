/**
 * Application route paths.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  PROFILE: "/profile",
  ROLES: "/roles",
  LEAVES: "/leaves",
  PROJECTS: "/projects",
  TIMESHEETS: "/timesheets",
  AUDIT_LOGS: "/audit-logs",
  INTEGRATIONS: "/integrations",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
