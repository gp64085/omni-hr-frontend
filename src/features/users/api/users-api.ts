import { apiClient } from "@/lib/api-client";
import {
  ProfileUpdatePayload,
  UserCreatePayload,
  UserListParams,
  UserUpdatePayload,
} from "@/features/users/types/user-types";
import { UserProfile, UserProfileData } from "@/types/user";
import { StandardApiResponse } from "@/types/api";

export const usersApi = {
  getCurrentUser: async (): Promise<StandardApiResponse<UserProfile>> => {
    const res = await apiClient.get("/users/me");
    return res.data;
  },

  getProfile: async (): Promise<StandardApiResponse<UserProfileData>> => {
    const res = await apiClient.get("/users/me/profile");
    return res.data;
  },

  updateProfile: async (
    payload: ProfileUpdatePayload
  ): Promise<StandardApiResponse<UserProfileData>> => {
    const res = await apiClient.put("/users/me/profile", payload);
    return res.data;
  },

  listUsers: async (params?: UserListParams): Promise<StandardApiResponse<UserProfile[]>> => {
    const res = await apiClient.get("/users", { params });
    return res.data;
  },

  createUser: async (payload: UserCreatePayload): Promise<StandardApiResponse<UserProfile>> => {
    const res = await apiClient.post("/users", payload);
    return res.data;
  },

  getUserById: async (id: string): Promise<StandardApiResponse<UserProfile>> => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  updateUser: async (
    id: string,
    payload: UserUpdatePayload
  ): Promise<StandardApiResponse<UserProfile>> => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: string): Promise<StandardApiResponse<{ message: string }>> => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};
