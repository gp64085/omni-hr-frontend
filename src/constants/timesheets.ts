/**
 * Timesheet hours targets, limits, and defaults.
 */
export const TIMESHEET_CONSTANTS = {
  STANDARD_WEEKLY_HOURS: 40.0,
  DEFAULT_DAILY_HOURS: 8.0,
  MIN_ENTRY_HOURS: 0.5,
  MAX_ENTRY_HOURS: 24.0,
  HOURS_STEP: 0.5,
  DAYS_IN_WEEK: 7,
} as const;

export const TIME_PRESET_HOURS = [1.0, 2.0, 4.0, 6.0, 8.0] as const;

export const TIMESHEET_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
