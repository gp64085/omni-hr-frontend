import {
  format,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isToday as isTodayDateFns,
  isFuture as isFutureDateFns,
  isPast as isPastDateFns,
} from "date-fns";

/**
 * Returns ISO strings for Monday and Sunday of the given week offset from today.
 * offset: 0 for current week, -1 for previous week, +1 for next week
 */
export function getWeekDates(offset: number = 0): {
  startDate: string;
  endDate: string;
  formattedRange: string;
} {
  const targetDate = addWeeks(new Date(), offset);
  const mon = startOfWeek(targetDate, { weekStartsOn: 1 });
  const sun = endOfWeek(targetDate, { weekStartsOn: 1 });

  const startDate = format(mon, "yyyy-MM-dd");
  const endDate = format(sun, "yyyy-MM-dd");
  const formattedRange = `${formatShortDate(startDate)} — ${formatShortDate(endDate)}`;

  return { startDate, endDate, formattedRange };
}

/**
 * Formats ISO date string into "Aug 17, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, "MMM d, yyyy") : dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Formats ISO date string into "Aug 17"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, "MMM d") : dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Checks if a given date string is today
 */
export function isTodayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? isTodayDateFns(parsed) : false;
  } catch {
    return false;
  }
}

/**
 * Checks if a given date string is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? isFutureDateFns(parsed) : false;
  } catch {
    return false;
  }
}

/**
 * Checks if a given date string is in the past (before today)
 */
export function hasDatePassed(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr < getTodayDateString();
}

/**
 * Checks if a given date string is in the past
 */
export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? isPastDateFns(parsed) : false;
  } catch {
    return false;
  }
}

/**
 * Formats a decimal hour number (e.g. 9.58) into "HH:mm" (e.g. "09:35")
 */
export function formatDecimalHoursToHHMM(decimalHours: number): string {
  const totalMinutes = Math.round((decimalHours || 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Formats total minutes into "HH:mm" (e.g. 575 -> "09:35")
 */
export function formatMinutesToHHMM(totalMinutes: number): string {
  const h = Math.floor((totalMinutes || 0) / 60);
  const m = Math.round((totalMinutes || 0) % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
