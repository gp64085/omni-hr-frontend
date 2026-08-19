import {
  format,
  parse,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfDay,
  addMinutes,
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
 * Formats total minutes into "HH:mm" (e.g. 575 -> "09:35") using date-fns
 */
export function formatMinutesToHHMM(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes || 0)));
  const baseDate = startOfDay(new Date());
  const dateWithMinutes = addMinutes(baseDate, clamped);
  return format(dateWithMinutes, "HH:mm");
}

/**
 * Formats a decimal hour number (e.g. 9.58) into "HH:mm" (e.g. "09:35") using date-fns
 */
export function formatDecimalHoursToHHMM(decimalHours: number): string {
  const totalMinutes = Math.round((decimalHours || 0) * 60);
  return formatMinutesToHHMM(totalMinutes);
}

/**
 * Parses user input into total minutes using date-fns with intelligent fallback:
 * - "8" / "08" -> 480 mins (8 hours)
 * - "12" -> 720 mins (12 hours)
 * - "8:30" / "08:30" -> 510 mins (8.5 hours)
 * - "1.5" -> 90 mins (1.5 hours)
 * - "45m" -> 45 mins
 * - "2h 30m" -> 150 mins
 */
export function parseTimeToMinutes(input: string): number {
  if (!input || !input.trim()) return 0;
  const str = input.trim().toLowerCase();

  // Pattern: "Xh Ym" or "Xh" or "Ym"
  if (str.includes("h") || str.includes("m")) {
    let total = 0;
    const hMatch = str.match(/(\d+(?:\.\d+)?)\s*h/);
    if (hMatch) total += parseFloat(hMatch[1]) * 60;
    const mMatch = str.match(/(\d+)\s*m/);
    if (mMatch) total += parseInt(mMatch[1], 10);
    return Math.min(24 * 60, Math.max(0, Math.round(total)));
  }

  // Use date-fns for standard time format parsing (e.g. "HH:mm", "H:mm", "HH:m", "H:m")
  if (str.includes(":")) {
    const referenceDate = startOfDay(new Date());
    for (const fmt of ["HH:mm", "H:mm", "HH:m", "H:m"]) {
      const parsedDate = parse(str, fmt, referenceDate);
      if (isValid(parsedDate)) {
        const mins = parsedDate.getHours() * 60 + parsedDate.getMinutes();
        return Math.min(24 * 60, Math.max(0, mins));
      }
    }
  }

  // Pattern: "8.5" or "1.75" (decimal hours)
  if (str.includes(".")) {
    const decimal = parseFloat(str) || 0;
    return Math.min(24 * 60, Math.max(0, Math.round(decimal * 60)));
  }

  // Pure integer string: e.g. "8", "12", "08" -> parsed as hours
  const intVal = parseInt(str, 10);
  if (!isNaN(intVal)) {
    return Math.min(24 * 60, Math.max(0, intVal * 60));
  }

  return 0;
}
