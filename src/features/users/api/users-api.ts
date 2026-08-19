import { apiClient } from "@/lib/api-client";
import { createCrudApi } from "@/lib/api-factory";
import {
  ProfileUpdatePayload,
  UserCreatePayload,
  UserListParams,
  UserUpdatePayload,
} from "@/features/users/types/user-types";
import { UserProfile, UserProfileData } from "@/types/user";
import { StandardApiResponse } from "@/types/api";

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
  deleteUser: async (id: string): Promise<StandardApiResponse<{ message: string }>> => {
    const res = await apiClient.delete<StandardApiResponse<{ message: string }>>(`/users/${id}`);
    return res.data;
  },

  getCurrentUser: async (): Promise<StandardApiResponse<UserProfile>> => {
    const res = await apiClient.get<StandardApiResponse<UserProfile>>("/users/me");
    return res.data;
  },

  getProfile: async (): Promise<StandardApiResponse<UserProfileData>> => {
    const res = await apiClient.get<StandardApiResponse<UserProfileData>>("/users/me/profile");
    return res.data;
  },

  updateProfile: async (
    payload: ProfileUpdatePayload
  ): Promise<StandardApiResponse<UserProfileData>> => {
    const res = await apiClient.put<StandardApiResponse<UserProfileData>>(
      "/users/me/profile",
      payload
    );
    return res.data;
  },
};
