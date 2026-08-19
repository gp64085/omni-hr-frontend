import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications-api";
import { queryKeys } from "@/lib/query-keys";

export function useUnreadCountQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await notificationsApi.getUnreadCount();
      return res.data?.unread_count || 0;
    },
    enabled: options?.enabled !== false,
    refetchInterval: 30000, // Background poll every 30 seconds
    staleTime: 15 * 1000,
  });
}

export function useNotificationsListQuery(options?: { enabled?: boolean; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list({ limit: options?.limit || 25 }),
    queryFn: async () => {
      const res = await notificationsApi.listNotifications({ limit: options?.limit || 25 });
      return res.data || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 15 * 1000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
