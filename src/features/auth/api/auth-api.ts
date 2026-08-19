import { apiClient } from "@/lib/api-client";
import { LoginPayload, TokenResponseData } from "@/features/auth/types/auth-types";
import { UserProfile } from "@/types/user";
import { ApiResponse } from "@/types/api";

export const authApi = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<ApiResponse<TokenResponseData>>("/auth/login", payload);
    return res.data;
  },

  getMe: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<ApiResponse<UserProfile>>("/auth/me", {
      headers,
    });
    return res.data;
  },

  logout: async (refreshToken: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>("/auth/logout", {
      refresh_token: refreshToken,
    });
    return res.data;
  },
};
