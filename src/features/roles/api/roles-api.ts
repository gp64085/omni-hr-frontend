import { apiClient } from "@/lib/api-client";
import { createCrudApi } from "@/lib/api-factory";
import { Permission, Role, RoleCreatePayload, RoleUpdatePayload } from "../types/role-types";
import { StandardApiResponse } from "@/types/api";

const baseRolesApi = createCrudApi<Role, RoleCreatePayload, RoleUpdatePayload>("/roles");

export const rolesApi = {
  ...baseRolesApi,

  // Domain method aliases
  listRoles: baseRolesApi.list,
  getRoleById: baseRolesApi.getById,
  createRole: baseRolesApi.create,
  updateRole: baseRolesApi.update,
  deleteRole: baseRolesApi.delete,

  getRolePermissions: async (roleId: string): Promise<StandardApiResponse<Permission[]>> => {
    const res = await apiClient.get<StandardApiResponse<Permission[]>>(
      `/roles/${roleId}/permissions`
    );
    return res.data;
  },

  listPermissions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
  }): Promise<StandardApiResponse<Permission[]>> => {
    const res = await apiClient.get<StandardApiResponse<Permission[]>>("/permissions", { params });
    return res.data;
  },

  createPermission: async (payload: {
    code: string;
    module: string;
    description?: string;
  }): Promise<Permission> => {
    const { data: response } = await apiClient.post<StandardApiResponse<Permission>>(
      "/permissions",
      payload
    );
    return response.data;
  },

  updatePermission: async (
    id: string,
    payload: {
      code?: string;
      module?: string;
      description?: string;
    }
  ): Promise<Permission> => {
    const { data: response } = await apiClient.put<StandardApiResponse<Permission>>(
      `/permissions/${id}`,
      payload
    );
    return response.data;
  },
};
