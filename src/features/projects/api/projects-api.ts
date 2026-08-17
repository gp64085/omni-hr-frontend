import { apiClient } from "@/lib/api-client";
import { Project, ProjectCreatePayload, ProjectUpdatePayload } from "../types/project-types";
import { StandardApiResponse } from "@/types/api";

export const projectsApi = {
  listProjects: async (params?: {
    department_id?: string;
  }): Promise<StandardApiResponse<Project[]>> => {
    const res = await apiClient.get("/projects", { params });
    return res.data;
  },

  getProjectById: async (id: string): Promise<StandardApiResponse<Project>> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (payload: ProjectCreatePayload): Promise<StandardApiResponse<Project>> => {
    const res = await apiClient.post("/projects", payload);
    return res.data;
  },

  updateProject: async (
    id: string,
    payload: ProjectUpdatePayload
  ): Promise<StandardApiResponse<Project>> => {
    const res = await apiClient.put(`/projects/${id}`, payload);
    return res.data;
  },
};
