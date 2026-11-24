"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Permission, PermissionUpdatePayload } from "../types/role-types";
import { EditPermissionForm } from "../forms/EditPermissionForm";

export interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSubmit: (id: string, payload: PermissionUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditPermissionModal({
  isOpen,
  onClose,
  permission,
  onSubmit,
  isLoading,
}: EditPermissionModalProps) {
  if (!permission) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Permission: ${permission.code}`}
      maxWidth="md"
    >
      <EditPermissionForm
        key={permission.id}
        permission={permission}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
