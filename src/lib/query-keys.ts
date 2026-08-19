/**
 * Centralized Query Keys Factory for TanStack React Query.
 * Organizes server-state cache keys hierarchically for fine-grained invalidation.
 */

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (userId?: string) => [...queryKeys.users.all, "profile", userId] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.roles.lists(), params] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
    permissions: (params?: Record<string, unknown>) =>
      [...queryKeys.roles.all, "permissions", params] as const,
  },
  leaves: {
    all: ["leaves"] as const,
    balances: (userId?: string) => [...queryKeys.leaves.all, "balances", userId] as const,
    myRequests: (params?: Record<string, unknown>) =>
      [...queryKeys.leaves.all, "my-requests", params] as const,
    teamRequests: (params?: Record<string, unknown>) =>
      [...queryKeys.leaves.all, "team-requests", params] as const,
    types: () => [...queryKeys.leaves.all, "types"] as const,
    holidays: (year?: number) => [...queryKeys.leaves.all, "holidays", year] as const,
  },
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.projects.lists(), params] as const,
    details: () => [...queryKeys.projects.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  timesheets: {
    all: ["timesheets"] as const,
    entries: (params?: Record<string, unknown>) =>
      [...queryKeys.timesheets.all, "entries", params] as const,
    weeklySummary: (startDate: string, endDate: string, userId?: string) =>
      [...queryKeys.timesheets.all, "weekly-summary", startDate, endDate, userId] as const,
    teamReviews: (params?: Record<string, unknown>) =>
      [...queryKeys.timesheets.all, "team-reviews", params] as const,
  },
  audit: {
    all: ["audit"] as const,
    lists: () => [...queryKeys.audit.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.audit.lists(), params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unreadCount: (userId?: string) =>
      [...queryKeys.notifications.all, "unread-count", userId] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, "list", params] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (userId?: string) => [...queryKeys.dashboard.all, "summary", userId] as const,
    calendar: (year: number, month: number, userId?: string) =>
      [...queryKeys.dashboard.all, "calendar", year, month, userId] as const,
  },
};
