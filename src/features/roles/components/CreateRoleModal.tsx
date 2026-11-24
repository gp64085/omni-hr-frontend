"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { RoleCreatePayload } from "../types/role-types";
import { CreateRoleForm } from "../forms/CreateRoleForm";

export interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RoleCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateRoleModal({ isOpen, onClose, onSubmit, isLoading }: CreateRoleModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Role" maxWidth="2xl">
      <CreateRoleForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
