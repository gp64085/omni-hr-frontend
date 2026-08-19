import { apiClient } from "@/lib/api-client";
import { LoginPayload, TokenResponseData } from "@/features/auth/types/auth-types";
import { UserProfile } from "@/types/user";
import { StandardApiResponse } from "@/types/api";

export const authApi = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<StandardApiResponse<TokenResponseData>>(
      "/auth/login",
      payload
    );
    return res.data;
  },

  getMe: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<StandardApiResponse<UserProfile>>("/auth/me", {
      headers,
    });
    return res.data;
  },

  logout: async (refreshToken: string) => {
    const res = await apiClient.post<StandardApiResponse<{ message: string }>>("/auth/logout", {
      refresh_token: refreshToken,
    });
    return res.data;
  },
};
