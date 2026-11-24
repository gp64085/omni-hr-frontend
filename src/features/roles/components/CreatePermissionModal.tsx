"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { CreatePermissionForm } from "../forms/CreatePermissionForm";

export interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { code: string; module: string; description?: string }) => Promise<void>;
  isLoading: boolean;
}

export function CreatePermissionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreatePermissionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Permission" maxWidth="md">
      <CreatePermissionForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
