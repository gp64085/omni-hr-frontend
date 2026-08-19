import { apiClient } from "@/lib/api-client";
import { createCrudApi } from "@/lib/api-factory";
import { Permission, Role, RoleCreatePayload, RoleUpdatePayload } from "../types/role-types";
import { ApiResponse } from "@/types/api";

const baseRolesApi = createCrudApi<Role, RoleCreatePayload, RoleUpdatePayload>("/roles");

export const rolesApi = {
  ...baseRolesApi,

  // Domain method aliases
  listRoles: baseRolesApi.list,
  getRoleById: baseRolesApi.getById,
  createRole: baseRolesApi.create,
  updateRole: baseRolesApi.update,
  deleteRole: baseRolesApi.delete,

  getRolePermissions: async (roleId: string): Promise<ApiResponse<Permission[]>> => {
    const res = await apiClient.get<ApiResponse<Permission[]>>(`/roles/${roleId}/permissions`);
    return res.data;
  },
};
