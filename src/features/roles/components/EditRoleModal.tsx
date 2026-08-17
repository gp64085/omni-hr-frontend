"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Role, RoleUpdatePayload } from "../types/role-types";
import { EditRoleForm } from "./EditRoleForm";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSubmit: (id: string, payload: RoleUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditRoleModal({ isOpen, onClose, role, onSubmit, isLoading }: EditRoleModalProps) {
  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role: ${role.name}`}
      description={
        role.is_system
          ? "System roles have predefined boundaries; permission updates apply immediately."
          : "Modify custom role parameters and assigned permissions."
      }
      maxWidth="2xl"
    >
      <EditRoleForm
        key={role.id}
        role={role}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
