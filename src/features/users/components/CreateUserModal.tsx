"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { rolesApi } from "@/features/roles/api/roles-api";
import { Role } from "@/features/roles/types/role-types";
import { UserCreatePayload } from "../types/user-types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UserCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateUserModal({ isOpen, onClose, onSubmit, isLoading }: CreateUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isOpen) {
      rolesApi.listRoles().then((res) => {
        if (res.data) {
          setRoles(res.data);
          if (res.data.length > 0 && !roleId) {
            setRoleId(res.data[0].id);
          }
        }
      });
    }
  }, [isOpen, roleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role_id: roleId || undefined,
    });
    // Reset
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Employee" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>

        <Input
          label="Corporate Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane.doe@company.com"
          required
        />

        <Input
          label="Initial Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="SecurePass123!"
          required
        />

        <Select
          label="Assigned System Role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          options={roles.map((r) => ({
            value: r.id,
            label: `${r.name.replace("_", " ")} ${r.is_system ? "(System)" : "(Custom)"}`,
          }))}
        />

        <ModalFooter
          onCancel={onClose}
          submitLabel="Create Employee Account"
          isLoading={isLoading}
        />
      </form>
    </Modal>
  );
}
