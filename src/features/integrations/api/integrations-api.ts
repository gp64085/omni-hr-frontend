import { apiClient } from "@/lib/api-client";
import {
  IntegrationConfig,
  SaveIntegrationPayload,
  TestConnectionResponse,
} from "../types/integration-types";

export const integrationsApi = {
  listIntegrations: async (): Promise<IntegrationConfig[]> => {
    const res = await apiClient.get<{ success: boolean; data: IntegrationConfig[] }>(
      "/integrations"
    );
    return res.data.data;
  },

  getIntegration: async (platform: string): Promise<IntegrationConfig> => {
    const res = await apiClient.get<{ success: boolean; data: IntegrationConfig }>(
      `/integrations/${platform}`
    );
    return res.data.data;
  },

  saveIntegration: async (
    platform: string,
    payload: SaveIntegrationPayload
  ): Promise<IntegrationConfig> => {
    const res = await apiClient.put<{ success: boolean; data: IntegrationConfig }>(
      `/integrations/${platform}`,
      payload
    );
    return res.data.data;
  },

  testConnection: async (
    platform: string,
    credentials?: Record<string, unknown>
  ): Promise<TestConnectionResponse> => {
    const res = await apiClient.post<{ success: boolean; data: TestConnectionResponse }>(
      `/integrations/${platform}/test`,
      credentials ? { credentials } : {}
    );
    return res.data.data;
  },

  listGroqModels: async (apiKey?: string): Promise<string[]> => {
    const res = await apiClient.get<{ success: boolean; data: string[] }>(
      "/integrations/groq/models",
      apiKey ? { params: { api_key: apiKey } } : {}
    );
    return res.data.data;
  },
};
