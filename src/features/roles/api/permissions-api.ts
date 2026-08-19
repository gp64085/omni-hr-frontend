import { apiClient } from "@/lib/api-client";
import { createCrudApi } from "@/lib/api-factory";
import { Permission, PermissionCreatePayload, PermissionUpdatePayload } from "../types/role-types";
import { ApiResponse, BaseQueryParams } from "@/types/api";

export interface PermissionListParams extends BaseQueryParams {
  module?: string;
}

const basePermissionsApi = createCrudApi<
  Permission,
  PermissionCreatePayload,
  PermissionUpdatePayload,
  PermissionListParams
>("/permissions");

export const permissionsApi = {
  ...basePermissionsApi,

  // Domain method aliases
  listPermissions: basePermissionsApi.list,
  getPermissionById: basePermissionsApi.getById,
  createPermission: async (payload: PermissionCreatePayload): Promise<Permission> => {
    const { data: response } = await apiClient.post<ApiResponse<Permission>>(
      "/permissions",
      payload
    );
    return response.data;
  },
  updatePermission: async (id: string, payload: PermissionUpdatePayload): Promise<Permission> => {
    const { data: response } = await apiClient.put<ApiResponse<Permission>>(
      `/permissions/${id}`,
      payload
    );
    return response.data;
  },
};
