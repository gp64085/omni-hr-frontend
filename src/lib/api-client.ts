import axios from "axios";
import { STORAGE_KEYS, ROUTES } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().accessToken ||
    (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry / rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshToken =
        useAuthStore.getState().refreshToken ||
        (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null);

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          if (res.data?.data?.access_token) {
            const newToken = res.data.data.access_token;
            const newRefreshToken = res.data.data.refresh_token || refreshToken;
            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
              useAuthStore.getState().setAuth(currentUser, newToken, newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.LOGIN;
          }
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LOGIN;
        }
      }
    }
    return Promise.reject(error);
  }
);
