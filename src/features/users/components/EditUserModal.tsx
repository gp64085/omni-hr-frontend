"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { UserProfile } from "@/types/user";
import { UserUpdatePayload } from "../types/user-types";
import { EditUserForm } from "./EditUserForm";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSubmit: (id: string, payload: UserUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditUserModal({ isOpen, onClose, user, onSubmit, isLoading }: EditUserModalProps) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile: ${user.first_name} ${user.last_name}`}
      description="Modify workforce credentials, organizational designation, department affiliation, and security role."
    >
      <EditUserForm
        key={user.id}
        user={user}
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
