"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal";
import { EditProjectModal } from "@/features/projects/components/EditProjectModal";
import { Button } from "@/components/ui/Button";
import { FolderPlus } from "lucide-react";
import { projectsApi } from "@/features/projects/api/projects-api";
import {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
} from "@/features/projects/types/project-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PERMISSIONS } from "@/constants";

export default function ProjectsPage() {
  const { hasPermission } = useAuthStore();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await projectsApi.listProjects();
        if (isMounted && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        if (isMounted) {
          error("Failed to load projects", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, error]);

  const handleCreateProject = async (payload: ProjectCreatePayload) => {
    setActionLoading(true);
    try {
      await projectsApi.createProject(payload);
      success("Project Created", `Project '${payload.name}' has been created.`);
      setCreateModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to create project", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProject = async (id: string, payload: ProjectUpdatePayload) => {
    setActionLoading(true);
    try {
      await projectsApi.updateProject(id, payload);
      success("Project Updated", "Project configuration has been saved.");
      setEditModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to update project", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
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
          isLoading={actionLoading}
        />

        <EditProjectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          project={selectedProject}
          onSubmit={handleUpdateProject}
          isLoading={actionLoading}
        />
      </div>
    </AppShell>
  );
}
