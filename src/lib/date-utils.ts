/**
 * Returns ISO strings for Monday and Sunday of the given week offset from today.
 * offset: 0 for current week, -1 for previous week, +1 for next week
 */
export function getWeekDates(offset: number = 0): {
  startDate: string;
  endDate: string;
  formattedRange: string;
} {
  const today = new Date();
  today.setDate(today.getDate() + offset * 7);
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

  const monday = new Date(today.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = monday.toISOString().split("T")[0];
  const endDate = sunday.toISOString().split("T")[0];

  const formattedRange = `${formatShortDate(startDate)} — ${formatShortDate(endDate)}`;

  return { startDate, endDate, formattedRange };
}

/**
 * Formats date into "Aug 17, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats date into "Aug 17"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
