import { createCrudApi } from "@/lib/api-factory";
import { Project, ProjectCreatePayload, ProjectUpdatePayload } from "../types/project-types";

const baseProjectsApi = createCrudApi<
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  { department_id?: string }
>("/projects");

export const projectsApi = {
  ...baseProjectsApi,

  // Domain method aliases
  listProjects: baseProjectsApi.list,
  getProjectById: baseProjectsApi.getById,
  createProject: baseProjectsApi.create,
  updateProject: baseProjectsApi.update,
};
