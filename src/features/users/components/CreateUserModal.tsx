"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { UserCreatePayload } from "../types/user-types";
import { CreateUserForm } from "../forms/CreateUserForm";

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UserCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateUserModal({ isOpen, onClose, onSubmit, isLoading }: CreateUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Employee" maxWidth="xl">
      <CreateUserForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
