"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { ProjectCreatePayload } from "../types/project-types";
import { CreateProjectForm } from "../forms/CreateProjectForm";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateProjectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" maxWidth="xl">
      <CreateProjectForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
