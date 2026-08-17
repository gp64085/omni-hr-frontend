import { apiClient } from "@/lib/api-client";
import {
  Permission,
  PermissionCreatePayload,
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
} from "../types/role-types";
import { StandardApiResponse } from "@/types/api";

export const rolesApi = {
  listRoles: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StandardApiResponse<Role[]>> => {
    const res = await apiClient.get("/roles", { params });
    return res.data;
  },

  getRoleById: async (id: string): Promise<StandardApiResponse<Role>> => {
    const res = await apiClient.get(`/roles/${id}`);
    return res.data;
  },

  getRolePermissions: async (roleId: string): Promise<StandardApiResponse<Permission[]>> => {
    const res = await apiClient.get(`/roles/${roleId}/permissions`);
    return res.data;
  },

  createRole: async (payload: RoleCreatePayload): Promise<StandardApiResponse<Role>> => {
    const res = await apiClient.post("/roles", payload);
    return res.data;
  },

  updateRole: async (
    id: string,
    payload: RoleUpdatePayload
  ): Promise<StandardApiResponse<Role>> => {
    const res = await apiClient.put(`/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  listPermissions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
  }): Promise<StandardApiResponse<Permission[]>> => {
    const res = await apiClient.get("/permissions", { params });
    return res.data;
  },

  createPermission: async (
    payload: PermissionCreatePayload
  ): Promise<StandardApiResponse<Permission>> => {
    const res = await apiClient.post("/permissions", payload);
    return res.data;
  },
};
