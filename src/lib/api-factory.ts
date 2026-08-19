import { apiClient } from "./api-client";
import { StandardApiResponse } from "@/types/api";

export interface BasePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Generic, reusable CRUD API factory to generate standardized client endpoints.
 */
export function createCrudApi<
  T,
  CreatePayload = Partial<T>,
  UpdatePayload = Partial<T>,
  ListParams extends object = BasePaginationParams,
>(basePath: string) {
  return {
    list: async (params?: ListParams): Promise<StandardApiResponse<T[]>> => {
      const res = await apiClient.get<StandardApiResponse<T[]>>(basePath, { params });
      return res.data;
    },

    getById: async (id: string): Promise<StandardApiResponse<T>> => {
      const res = await apiClient.get<StandardApiResponse<T>>(`${basePath}/${id}`);
      return res.data;
    },

    create: async (payload: CreatePayload): Promise<StandardApiResponse<T>> => {
      const res = await apiClient.post<StandardApiResponse<T>>(basePath, payload);
      return res.data;
    },

    update: async (id: string, payload: UpdatePayload): Promise<StandardApiResponse<T>> => {
      const res = await apiClient.put<StandardApiResponse<T>>(`${basePath}/${id}`, payload);
      return res.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`${basePath}/${id}`);
    },
  };
}
