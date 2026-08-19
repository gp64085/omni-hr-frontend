import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leavesApi, holidaysApi } from "@/features/leaves/api/leaves-api";
import { timesheetsApi } from "@/features/timesheets/api/timesheets-api";
import { LeaveRequest, Holiday } from "@/features/leaves/types/leave-types";
import { TimesheetEntry } from "@/features/timesheets/types/timesheet-types";
import { PAGINATION, LEAVE_STATUS } from "@/constants";
import { queryKeys } from "@/lib/query-keys";

export interface DayEvents {
  isWeekend: boolean;
  isHoliday: boolean;
  holidays: Holiday[];
  leaves: LeaveRequest[];
  timesheets: TimesheetEntry[];
  totalMinutes: number;
  hasEvents: boolean;
}

export function useDashboardCalendar() {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split("T")[0], [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());

  const firstDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const lastDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: monthData, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.calendar(currentYear, currentMonth),
    queryFn: async () => {
      const [leavesRes, holidaysRes, timesheetRes] = await Promise.all([
        leavesApi
          .listLeaveRequests({ status: LEAVE_STATUS.APPROVED, limit: PAGINATION.MAX_LIMIT })
          .catch(() => ({ data: [] })),
        holidaysApi.listHolidays(currentYear).catch(() => ({ data: [] })),
        timesheetsApi
          .listEntries({
            start_date: firstDayStr,
            end_date: lastDayStr,
            limit: PAGINATION.MAX_LIMIT,
          })
          .catch(() => ({ data: [] })),
      ]);

      return {
        leaves: (leavesRes.data || []) as LeaveRequest[],
        holidays: (holidaysRes.data || []) as Holiday[],
        timesheets: (timesheetRes.data || []) as TimesheetEntry[],
      };
    },
    staleTime: 60 * 1000,
  });

  const refreshCalendar = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.calendar(currentYear, currentMonth),
    });
  }, [queryClient, currentYear, currentMonth]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const handleJumpToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  }, []);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    const items = monthData?.holidays || [];
    for (const holiday of items) {
      const existing = map.get(holiday.holiday_date) || [];
      existing.push(holiday);
      map.set(holiday.holiday_date, existing);
    }
    return map;
  }, [monthData?.holidays]);

  const timesheetsByDate = useMemo(() => {
    const map = new Map<string, TimesheetEntry[]>();
    const items = monthData?.timesheets || [];
    for (const item of items) {
      const existing = map.get(item.work_date) || [];
      existing.push(item);
      map.set(item.work_date, existing);
    }
    return map;
  }, [monthData?.timesheets]);

  // Filter approved leaves
  const approvedLeaves = useMemo(() => {
    const items = monthData?.leaves || [];
    return items.filter((leave) => leave.status === LEAVE_STATUS.APPROVED);
  }, [monthData?.leaves]);

  // Grid layout computations
  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth]
  );

  const firstDayOfWeek = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentYear, currentMonth]
  );

  const startOffset = useMemo(() => (firstDayOfWeek + 6) % 7, [firstDayOfWeek]);

  const getEventsForDate = useCallback(
    (dateStr: string): DayEvents => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dayHolidays = holidaysByDate.get(dateStr) || [];
      const isHoliday = dayHolidays.length > 0;

      const dayLeaves =
        isWeekend || isHoliday
          ? []
          : approvedLeaves.filter((leave) => {
              if (dateStr < leave.start_date || dateStr > leave.end_date) return false;
              if (leave.extra_metadata?.days && leave.extra_metadata.days.length > 0) {
                const dayItem = leave.extra_metadata.days.find((item) => item.date === dateStr);
                if (dayItem) {
                  return dayItem.day_status === LEAVE_STATUS.APPROVED;
                }
              }
              return true;
            });

      const dayTimesheets = timesheetsByDate.get(dateStr) || [];
      const totalMinutes = dayTimesheets.reduce(
        (sumMinutes, timesheet) => sumMinutes + (Number(timesheet.total_minutes_spent) || 0),
        0
      );

      return {
        isWeekend,
        isHoliday,
        holidays: dayHolidays,
        leaves: dayLeaves,
        timesheets: dayTimesheets,
        totalMinutes,
        hasEvents: dayHolidays.length > 0 || dayLeaves.length > 0 || dayTimesheets.length > 0,
      };
    },
    [holidaysByDate, timesheetsByDate, approvedLeaves]
  );

  return {
    currentYear,
    currentMonth,
    todayStr,
    isLoading,
    daysInMonth,
    startOffset,
    refreshCalendar,
    handlePrevMonth,
    handleNextMonth,
    handleJumpToday,
    getEventsForDate,
  };
}
