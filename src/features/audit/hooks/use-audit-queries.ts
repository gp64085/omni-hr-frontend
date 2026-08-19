import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit-api";
import { queryKeys } from "@/lib/query-keys";

export function useAuditLogsQuery(params?: {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  user_id?: string;
}) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: async () => {
      const res = await auditApi.listLogs(params);
      return {
        data: res.data || [],
        meta: res.meta || { total: res.data?.length || 0, page: 1, limit: 10, total_pages: 1 },
      };
    },
    staleTime: 30 * 1000,
  });
}
