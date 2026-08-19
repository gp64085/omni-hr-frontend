import { apiClient } from "@/lib/api-client";
import { AppNotification } from "../types/notification-types";
import { StandardApiResponse } from "@/types/api";

export const notificationsApi = {
  listNotifications: async (params?: {
    limit?: number;
    unread_only?: boolean;
  }): Promise<StandardApiResponse<AppNotification[]>> => {
    const res = await apiClient.get("/notifications", { params });
    return res.data;
  },

  getUnreadCount: async (): Promise<StandardApiResponse<{ unread_count: number }>> => {
    const res = await apiClient.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: string): Promise<StandardApiResponse<AppNotification>> => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<StandardApiResponse<{ message: string }>> => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
};
