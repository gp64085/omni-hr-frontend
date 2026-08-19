import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projects-api";
import { ProjectCreatePayload, ProjectUpdatePayload } from "../types/project-types";
import { queryKeys } from "@/lib/query-keys";
import { useAppMutation } from "@/lib/mutation-utils";

export function useProjectsQuery(params?: { department_id?: string }) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: async () => {
      const res = await projectsApi.list(params);
      return res.data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateProjectMutation() {
  return useAppMutation({
    mutationFn: (payload: ProjectCreatePayload) => projectsApi.create(payload),
    invalidateKeys: [queryKeys.projects.all],
    successMessage: (_, vars) => ({
      title: "Project Created",
      message: `Project '${vars.name}' has been created.`,
    }),
  });
}

export function useUpdateProjectMutation() {
  return useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdatePayload }) =>
      projectsApi.update(id, payload),
    invalidateKeys: [queryKeys.projects.all],
    successMessage: "Project configuration has been saved.",
  });
}
