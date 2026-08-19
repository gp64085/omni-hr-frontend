import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leavesApi, holidaysApi } from "../api/leaves-api";
import {
  LeaveRequestCreatePayload,
  LeaveStatusUpdatePayload,
  LeaveStatus,
} from "../types/leave-types";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";

export function useLeaveBalancesQuery() {
  return useQuery({
    queryKey: queryKeys.leaves.balances(),
    queryFn: async () => {
      const res = await leavesApi.getLeaveBalance();
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useMyLeaveRequestsQuery(params?: {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
}) {
  return useQuery({
    queryKey: queryKeys.leaves.myRequests(params),
    queryFn: async () => {
      const res = await leavesApi.listLeaveRequests(params);
      return {
        data: res.data || [],
        meta: res.meta || { total: res.data?.length || 0, page: 1, limit: 10, total_pages: 1 },
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useTeamLeaveRequestsQuery(
  params?: { page?: number; limit?: number; status?: LeaveStatus },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.leaves.teamRequests(params),
    queryFn: async () => {
      const res = await leavesApi.listLeaveRequests(params);
      return {
        data: res.data || [],
        meta: res.meta || { total: res.data?.length || 0, page: 1, limit: 10, total_pages: 1 },
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000,
  });
}

export function useHolidaysQuery(year?: number) {
  return useQuery({
    queryKey: queryKeys.leaves.holidays(year),
    queryFn: async () => {
      const res = await holidaysApi.listHolidays(year);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaveTypesQuery() {
  return useQuery({
    queryKey: queryKeys.leaves.types(),
    queryFn: async () => {
      const res = await leavesApi.getLeaveTypes();
      return res.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useApplyLeaveMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (payload: LeaveRequestCreatePayload) => leavesApi.applyLeave(payload),
    onSuccess: () => {
      success("Leave Request Submitted", "Your request is pending manager review.");
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Application Failed", getApiErrorMessage(err));
    },
  });
}

export function useCancelLeaveMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (requestId: string) => leavesApi.cancelLeave(requestId),
    onSuccess: () => {
      success("Leave Cancelled", "Request has been cancelled and quota restored.");
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Cancellation Failed", getApiErrorMessage(err));
    },
  });
}

export function useUpdateLeaveStatusMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LeaveStatusUpdatePayload }) =>
      leavesApi.updateLeaveStatus(id, payload),
    onSuccess: (_, variables) => {
      const isApproved = variables.payload.status === "approved";
      success(
        isApproved ? "Leave Approved" : "Leave Rejected",
        "Decision recorded and notification dispatched."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Status Update Failed", getApiErrorMessage(err));
    },
  });
}

export function useCreateHolidayMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (payload: { name: string; holiday_date: string; is_recurring?: boolean }) =>
      holidaysApi.createHoliday(payload),
    onSuccess: (_, variables) => {
      success("Holiday Added", `${variables.name} added to company calendar.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.holidays() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Failed to add holiday", getApiErrorMessage(err));
    },
  });
}

export function useTriggerAccrualsMutation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: () => leavesApi.triggerAccruals(),
    onSuccess: (res) => {
      success("Accrual Engine Executed", res.data?.message || "Quotas updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (err) => {
      error("Accrual Failed", getApiErrorMessage(err));
    },
  });
}
