import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users-api";
import { leavesApi, holidaysApi } from "@/features/leaves/api/leaves-api";
import { timesheetsApi } from "@/features/timesheets/api/timesheets-api";
import { queryKeys } from "@/lib/query-keys";
import { getWeekDates, getTodayDateString } from "@/lib/date-utils";
import { LEAVE_STATUS, PERMISSIONS } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

export function useDashboardSummaryQuery() {
  const { user, hasPermission } = useAuthStore();
  const canReadUsers = hasPermission(PERMISSIONS.USERS_READ);
  const canApproveLeaves = hasPermission(PERMISSIONS.LEAVE_APPROVE);

  return useQuery({
    queryKey: queryKeys.dashboard.summary(user?.id),
    queryFn: async () => {
      const todayStr = getTodayDateString();
      const { startDate, endDate } = getWeekDates(0);

      const [usersRes, balancesRes, holidaysRes, timesheetRes, pendingLeavesRes] =
        await Promise.all([
          canReadUsers ? usersApi.listUsers({ limit: 1 }).catch(() => null) : Promise.resolve(null),
          leavesApi.getLeaveBalance().catch(() => null),
          holidaysApi.listHolidays().catch(() => null),
          timesheetsApi
            .getWeeklySummary({ start_date: startDate, end_date: endDate })
            .catch(() => null),
          canApproveLeaves
            ? leavesApi
                .listLeaveRequests({ status: LEAVE_STATUS.PENDING, limit: 5 })
                .catch(() => null)
            : Promise.resolve(null),
        ]);

      const upcomingHolidays = (holidaysRes?.data || [])
        .filter((h) => h.holiday_date >= todayStr)
        .slice(0, 4);

      const totalEmployees = usersRes?.meta?.total ?? null;
      const balances = balancesRes?.data || [];
      const weeklyHours = timesheetRes?.data?.total_hours || 0;
      const pendingApprovalsCount = pendingLeavesRes?.meta?.total || 0;

      return {
        totalEmployees,
        balances,
        upcomingHolidays,
        weeklyHours,
        pendingApprovalsCount,
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}
