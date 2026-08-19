import { apiClient } from "@/lib/api-client";
import {
  TimesheetEntry,
  TimesheetEntryCreatePayload,
  TimesheetEntryUpdatePayload,
  TimesheetStatusUpdatePayload,
  TimesheetSubmitPayload,
  WeeklyTimesheetSummary,
} from "../types/timesheet-types";
import { ApiResponse } from "@/types/api";

export const timesheetsApi = {
  createEntry: async (
    payload: TimesheetEntryCreatePayload
  ): Promise<ApiResponse<TimesheetEntry>> => {
    const res = await apiClient.post("/timesheets/entries", payload);
    return res.data;
  },

  listEntries: async (params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<ApiResponse<TimesheetEntry[]>> => {
    const res = await apiClient.get("/timesheets/entries", { params });
    return res.data;
  },

  updateEntry: async (
    id: string,
    payload: TimesheetEntryUpdatePayload
  ): Promise<ApiResponse<TimesheetEntry>> => {
    const res = await apiClient.put(`/timesheets/entries/${id}`, payload);
    return res.data;
  },

  deleteEntry: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.delete(`/timesheets/entries/${id}`);
    return res.data;
  },

  submitTimesheets: async (
    payload: TimesheetSubmitPayload
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post("/timesheets/submit", payload);
    return res.data;
  },

  updateEntryStatus: async (
    id: string,
    payload: TimesheetStatusUpdatePayload
  ): Promise<ApiResponse<TimesheetEntry>> => {
    const res = await apiClient.patch(`/timesheets/entries/${id}/status`, payload);
    return res.data;
  },

  getWeeklySummary: async (params: {
    start_date: string;
    end_date: string;
    user_id?: string;
  }): Promise<ApiResponse<WeeklyTimesheetSummary>> => {
    const res = await apiClient.get("/timesheets/summary", { params });
    return res.data;
  },
};
