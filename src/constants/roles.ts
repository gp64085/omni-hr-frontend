/**
 * System roles recognized across the enterprise workspace.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  HR_MANAGER: "hr_manager",
  DEPARTMENT_LEAD: "department_lead",
  EMPLOYEE: "employee",
} as const;

export type SystemRoleName = (typeof ROLES)[keyof typeof ROLES];
