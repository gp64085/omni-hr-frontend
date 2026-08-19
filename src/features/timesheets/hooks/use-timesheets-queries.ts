import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timesheetsApi } from "../api/timesheets-api";
import {
  TimesheetEntryCreatePayload,
  TimesheetEntryUpdatePayload,
  TimesheetStatusUpdatePayload,
} from "../types/timesheet-types";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { formatMinutesToHHMM } from "@/lib/date-utils";

export function useTimesheetEntriesQuery(params?: {
  start_date?: string;
  end_date?: string;
  user_id?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.timesheets.entries(params),
    queryFn: async () => {
      const res = await timesheetsApi.listEntries(params);
      return res.data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useWeeklySummaryQuery(startDate: string, endDate: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.timesheets.weeklySummary(startDate, endDate, userId),
    queryFn: async () => {
      const res = await timesheetsApi.getWeeklySummary({
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
      });
      return res.data || null;
    },
    staleTime: 30 * 1000,
  });
}

export function useManagerTimesheetReviewQuery(
  params?: { start_date?: string; end_date?: string; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.timesheets.teamReviews(params),
    queryFn: async () => {
      const res = await timesheetsApi.listEntries(params);
      return res.data || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000,
  });
}

export function useLogTimesheetMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (payload: TimesheetEntryCreatePayload) => timesheetsApi.createEntry(payload),
    onSuccess: (_, variables) => {
      const totalMinutes = variables.total_minutes_spent || 0;
      success(
        "Work Logged",
        `Recorded timesheet entries (${formatMinutesToHHMM(totalMinutes)}) for ${variables.work_date}.`
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Log Failed", getApiErrorMessage(err));
    },
  });
}

export function useUpdateTimesheetMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TimesheetEntryUpdatePayload }) =>
      timesheetsApi.updateEntry(id, payload),
    onSuccess: () => {
      success("Timesheet Updated", "Your timesheet changes have been saved.");
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Update Failed", getApiErrorMessage(err));
    },
  });
}

export function useDeleteTimesheetMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => timesheetsApi.deleteEntry(id),
    onSuccess: () => {
      success("Entry Deleted", "Timesheet record removed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Delete Failed", getApiErrorMessage(err));
    },
  });
}

export function useUpdateTimesheetStatusMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TimesheetStatusUpdatePayload }) =>
      timesheetsApi.updateEntryStatus(id, payload),
    onSuccess: (_, variables) => {
      const isApproved = variables.payload.status === "approved";
      success(isApproved ? "Timesheet Approved" : "Timesheet Rejected", "Decision recorded.");
      queryClient.invalidateQueries({ queryKey: queryKeys.timesheets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Decision Failed", getApiErrorMessage(err));
    },
  });
}
