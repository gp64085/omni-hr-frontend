import { apiClient } from "./api-client";
import { ApiResponse, BaseQueryParams } from "@/types/api";

/**
 * Reusable CRUD API factory to generate standardized client endpoints.
 */
export function createCrudApi<
  T,
  CreatePayload = Partial<T>,
  UpdatePayload = Partial<T>,
  ListParams = BaseQueryParams,
>(basePath: string) {
  return {
    list: async (params?: ListParams): Promise<ApiResponse<T[]>> => {
      const res = await apiClient.get<ApiResponse<T[]>>(basePath, { params });
      return res.data;
    },

    getById: async (id: string): Promise<ApiResponse<T>> => {
      const res = await apiClient.get<ApiResponse<T>>(`${basePath}/${id}`);
      return res.data;
    },

    create: async (payload: CreatePayload): Promise<ApiResponse<T>> => {
      const res = await apiClient.post<ApiResponse<T>>(basePath, payload);
      return res.data;
    },

    update: async (id: string, payload: UpdatePayload): Promise<ApiResponse<T>> => {
      const res = await apiClient.put<ApiResponse<T>>(`${basePath}/${id}`, payload);
      return res.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`${basePath}/${id}`);
    },
  };
}
