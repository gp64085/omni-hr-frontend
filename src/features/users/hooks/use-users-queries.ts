import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users-api";
import { UserCreatePayload, UserUpdatePayload, ProfileUpdatePayload } from "../types/user-types";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/use-auth-store";
import { useAppMutation } from "@/lib/mutation-utils";

export function useUsersQuery(
  params?: { page?: number; limit?: number; department_id?: string; search?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const res = await usersApi.list(params);
      return {
        data: res.data || [],
        meta: res.meta || { total: res.data?.length || 0, page: 1, limit: 10, total_pages: 1 },
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000,
  });
}

export function useUserProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      const res = await usersApi.getProfile();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateUserMutation() {
  return useAppMutation({
    mutationFn: (payload: UserCreatePayload) => usersApi.create(payload),
    invalidateKeys: [queryKeys.users.all, queryKeys.dashboard.all],
    successMessage: (_, vars) => ({
      title: "Employee Created",
      message: `${vars.first_name} ${vars.last_name} has been added.`,
    }),
  });
}

export function useUpdateUserMutation() {
  return useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) =>
      usersApi.update(id, payload),
    invalidateKeys: [queryKeys.users.all],
    successMessage: "Account settings have been updated.",
  });
}

export function useDeleteUserMutation() {
  return useAppMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    invalidateKeys: [queryKeys.users.all, queryKeys.dashboard.all],
    successMessage: "User account has been removed.",
  });
}

export function useUpdateProfileMutation() {
  const { updateUser } = useAuthStore();

  return useAppMutation({
    mutationFn: (payload: ProfileUpdatePayload) => usersApi.updateProfile(payload),
    invalidateKeys: [queryKeys.users.profile(), queryKeys.auth.me()],
    successMessage: "Your self-service record has been updated successfully.",
    onSuccess: (res) => {
      if (res.data) {
        updateUser({ profile: res.data });
      }
    },
  });
}
