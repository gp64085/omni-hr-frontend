"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Project, ProjectUpdatePayload } from "../types/project-types";
import { EditProjectForm } from "./EditProjectForm";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmit: (id: string, payload: ProjectUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSubmit,
  isLoading,
}: EditProjectModalProps) {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Project: ${project.name}`}>
      <EditProjectForm
        key={project.id}
        project={project}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
