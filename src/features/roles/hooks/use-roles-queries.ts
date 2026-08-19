import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/roles-api";
import { permissionsApi, PermissionListParams } from "../api/permissions-api";
import {
  PermissionCreatePayload,
  PermissionUpdatePayload,
  RoleCreatePayload,
  RoleUpdatePayload,
} from "../types/role-types";
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

export function usePermissionsQuery(params?: PermissionListParams) {
  return useQuery({
    queryKey: queryKeys.permissions.list(params),
    queryFn: async () => {
      const res = await permissionsApi.listPermissions(params);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePermissionMutation() {
  return useAppMutation({
    mutationFn: (payload: PermissionCreatePayload) => permissionsApi.createPermission(payload),
    invalidateKeys: [queryKeys.permissions.all, queryKeys.roles.all],
    successMessage: (_, vars) => ({
      title: "Permission Created",
      message: `Permission '${vars.code}' has been registered in the catalog.`,
    }),
  });
}

export function useUpdatePermissionMutation() {
  return useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PermissionUpdatePayload }) =>
      permissionsApi.updatePermission(id, payload),
    invalidateKeys: [queryKeys.permissions.all, queryKeys.roles.all],
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
