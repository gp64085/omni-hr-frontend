import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";
import { LoginPayload } from "../types/auth-types";
import { useAuthStore } from "@/store/use-auth-store";
import { queryKeys } from "@/lib/query-keys";

export function useCurrentUserQuery() {
  const { accessToken, updateUser, logout } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      if (!accessToken) return null;
      try {
        const res = await authApi.getMe();
        if (res.data) {
          updateUser(res.data);
          return res.data;
        }
        return null;
      } catch (err) {
        logout();
        throw err;
      }
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      // Clear any prior user's server cache
      queryClient.clear();

      const loginRes = await authApi.login(credentials);
      const { access_token, refresh_token } = loginRes.data;
      const profileRes = await authApi.getMe(access_token);

      setAuth(profileRes.data, access_token, refresh_token);
      return profileRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // ignore network error on logout endpoint
        }
      }
      logout();
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}
