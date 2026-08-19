import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/roles-api";
import { RoleCreatePayload, RoleUpdatePayload } from "../types/role-types";
import { queryKeys } from "@/lib/query-keys";
import { useAppMutation } from "@/lib/mutation-utils";

export function useRolesQuery(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: async () => {
      const res = await rolesApi.list(params);
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function usePermissionsQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
}) {
  return useQuery({
    queryKey: queryKeys.roles.permissions(params),
    queryFn: async () => {
      const res = await rolesApi.listPermissions(params);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePermissionMutation() {
  return useAppMutation({
    mutationFn: (payload: { code: string; module: string; description?: string }) =>
      rolesApi.createPermission(payload),
    invalidateKeys: [queryKeys.roles.all],
    successMessage: (_, vars) => ({
      title: "Permission Created",
      message: `Permission '${vars.code}' has been registered in the catalog.`,
    }),
  });
}

export function useUpdatePermissionMutation() {
  return useAppMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { code?: string; module?: string; description?: string };
    }) => rolesApi.updatePermission(id, payload),
    invalidateKeys: [queryKeys.roles.all],
    successMessage: "Permission has been updated successfully.",
  });
}

export function useCreateRoleMutation() {
  return useAppMutation({
    mutationFn: (payload: RoleCreatePayload) => rolesApi.create(payload),
    invalidateKeys: [queryKeys.roles.all],
    successMessage: (_, vars) => ({
      title: "Role Created",
      message: `Custom role '${vars.name}' has been created.`,
    }),
  });
}

export function useUpdateRoleMutation() {
  return useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoleUpdatePayload }) =>
      rolesApi.update(id, payload),
    invalidateKeys: [queryKeys.roles.all],
    successMessage: "Role permissions and configuration updated.",
  });
}

export function useDeleteRoleMutation() {
  return useAppMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    invalidateKeys: [queryKeys.roles.all],
    successMessage: "Custom role was removed.",
  });
}
