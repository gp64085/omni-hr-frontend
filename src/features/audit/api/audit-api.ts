import { apiClient } from "@/lib/api-client";
import { AuditLog, AuditLogListParams } from "../types/audit-types";
import { StandardApiResponse } from "@/types/api";

export const auditApi = {
  listLogs: async (params?: AuditLogListParams): Promise<StandardApiResponse<AuditLog[]>> => {
    const res = await apiClient.get("/audit-logs", { params });
    return res.data;
  },
};
