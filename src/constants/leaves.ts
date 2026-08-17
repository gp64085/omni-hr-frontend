/**
 * Leave types, half-day sessions, and status constants.
 */
export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export const HALF_DAY_SESSIONS = {
  FIRST_HALF: "first_half",
  SECOND_HALF: "second_half",
} as const;

export const HALF_DAY_MULTIPLIER = 0.5;

export const ACCRUAL_FREQUENCIES = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  HALF_YEARLY: "half_yearly",
  YEARLY: "yearly",
  MANUAL: "manual",
} as const;
