import { apiClient } from "@/lib/api-client";
import {
  Holiday,
  LeaveAllocation,
  LeavePolicy,
  LeaveRequest,
  LeaveRequestCreatePayload,
  LeaveStatus,
  LeaveStatusUpdatePayload,
  LeaveType,
} from "../types/leave-types";
import { StandardApiResponse } from "@/types/api";

export const leavesApi = {
  getLeaveTypes: async (): Promise<StandardApiResponse<LeaveType[]>> => {
    const res = await apiClient.get("/leaves/types");
    return res.data;
  },

  getLeaveBalance: async (year?: number): Promise<StandardApiResponse<LeaveAllocation[]>> => {
    const res = await apiClient.get("/leaves/balance", { params: { year } });
    return res.data;
  },

  applyLeave: async (
    payload: LeaveRequestCreatePayload
  ): Promise<StandardApiResponse<LeaveRequest>> => {
    const res = await apiClient.post("/leaves/requests", payload);
    return res.data;
  },

  listLeaveRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: LeaveStatus;
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<StandardApiResponse<LeaveRequest[]>> => {
    const res = await apiClient.get("/leaves/requests", { params });
    return res.data;
  },

  updateLeaveStatus: async (
    id: string,
    payload: LeaveStatusUpdatePayload
  ): Promise<StandardApiResponse<LeaveRequest>> => {
    const res = await apiClient.patch(`/leaves/requests/${id}/status`, payload);
    return res.data;
  },

  cancelLeave: async (id: string): Promise<StandardApiResponse<{ message: string }>> => {
    const res = await apiClient.delete(`/leaves/requests/${id}`);
    return res.data;
  },

  listPolicies: async (): Promise<StandardApiResponse<LeavePolicy[]>> => {
    const res = await apiClient.get("/leaves/policies");
    return res.data;
  },

  createPolicy: async (payload: {
    role_id: string;
    leave_type_id: string;
    accrual_frequency: string;
    days_per_period: number;
    max_carry_forward_days: number;
    encashable: boolean;
  }): Promise<StandardApiResponse<LeavePolicy>> => {
    const res = await apiClient.post("/leaves/policies", payload);
    return res.data;
  },

  grantManualAllocation: async (payload: {
    user_id: string;
    leave_type_id: string;
    days: number;
    reason: string;
  }): Promise<StandardApiResponse<LeaveAllocation>> => {
    const res = await apiClient.post("/leaves/allocations/grant", payload);
    return res.data;
  },

  triggerAccruals: async (
    target_date?: string
  ): Promise<StandardApiResponse<{ message: string }>> => {
    const res = await apiClient.post("/leaves/accruals/run", null, { params: { target_date } });
    return res.data;
  },
};

export const holidaysApi = {
  listHolidays: async (year?: number): Promise<StandardApiResponse<Holiday[]>> => {
    const res = await apiClient.get("/holidays", { params: { year } });
    return res.data;
  },

  createHoliday: async (payload: {
    name: string;
    holiday_date: string;
    is_recurring?: boolean;
  }): Promise<StandardApiResponse<Holiday>> => {
    const res = await apiClient.post("/holidays", payload);
    return res.data;
  },
};
