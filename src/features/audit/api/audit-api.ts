import { apiClient } from "@/lib/api-client";
import { AuditLog, AuditLogListParams } from "../types/audit-types";
import { ApiResponse } from "@/types/api";

export const auditApi = {
  listLogs: async (params?: AuditLogListParams): Promise<ApiResponse<AuditLog[]>> => {
    const res = await apiClient.get("/audit-logs", { params });
    return res.data;
  },
};
