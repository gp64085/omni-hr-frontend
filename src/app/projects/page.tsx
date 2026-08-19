"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal";
import { EditProjectModal } from "@/features/projects/components/EditProjectModal";
import { Button } from "@/components/ui/Button";
import { FolderPlus } from "lucide-react";
import {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
} from "@/features/projects/types/project-types";
import { useAuthStore } from "@/store/use-auth-store";
import { PERMISSIONS } from "@/constants";
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "@/features/projects/hooks/use-projects-queries";

export default function ProjectsPage() {
  const { hasPermission } = useAuthStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Queries
  const { data: projects = [], isLoading } = useProjectsQuery();

  // Mutations
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();

  const handleCreateProject = async (payload: ProjectCreatePayload) => {
    await createMutation.mutateAsync(payload);
    setCreateModalOpen(false);
  };

  const handleUpdateProject = async (id: string, payload: ProjectUpdatePayload) => {
    await updateMutation.mutateAsync({ id, payload });
    setEditModalOpen(false);
  };

  const canWrite = hasPermission(PERMISSIONS.PROJECTS_WRITE);

  return (
    <AppShell
      title="Projects Management"
      subtitle={`Track and manage all ${projects.length} corporate projects and assignments`}
      actions={
        canWrite && (
          <Button
            variant="gradient"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <ProjectsGrid
          projects={projects}
          isLoading={isLoading}
          onEdit={(p) => {
            setSelectedProject(p);
            setEditModalOpen(true);
          }}
        />

        <CreateProjectModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          isLoading={createMutation.isPending}
        />

        <EditProjectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          project={selectedProject}
          onSubmit={handleUpdateProject}
          isLoading={updateMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
