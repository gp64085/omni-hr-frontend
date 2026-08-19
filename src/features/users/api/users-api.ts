import { apiClient } from "@/lib/api-client";
import { createCrudApi } from "@/lib/api-factory";
import {
  ProfileUpdatePayload,
  UserCreatePayload,
  UserListParams,
  UserUpdatePayload,
} from "@/features/users/types/user-types";
import { UserProfile, UserProfileData } from "@/types/user";
import { ApiResponse } from "@/types/api";

const baseUsersApi = createCrudApi<
  UserProfile,
  UserCreatePayload,
  UserUpdatePayload,
  UserListParams
>("/users");

export const usersApi = {
  ...baseUsersApi,

  // Domain aliases
  listUsers: baseUsersApi.list,
  getUserById: baseUsersApi.getById,
  createUser: baseUsersApi.create,
  updateUser: baseUsersApi.update,
  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return res.data;
  },

  getProfile: async (): Promise<ApiResponse<UserProfileData>> => {
    const res = await apiClient.get<ApiResponse<UserProfileData>>("/users/me/profile");
    return res.data;
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<ApiResponse<UserProfileData>> => {
    const res = await apiClient.put<ApiResponse<UserProfileData>>("/users/me/profile", payload);
    return res.data;
  },
};
