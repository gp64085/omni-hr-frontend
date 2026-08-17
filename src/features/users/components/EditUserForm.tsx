"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { rolesApi } from "@/features/roles/api/roles-api";
import { Role } from "@/features/roles/types/role-types";
import { UserProfile } from "@/types/user";
import { UserUpdatePayload } from "../types/user-types";
import { PAGINATION } from "@/constants";

interface EditUserFormProps {
  user: UserProfile;
  onClose: () => void;
  onSubmit: (id: string, payload: UserUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditUserForm({ user, onClose, onSubmit, isLoading }: EditUserFormProps) {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [roleId, setRoleId] = useState(user.role?.id || user.role_id || "");
  const [isActive, setIsActive] = useState(user.is_active);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    let isMounted = true;
    rolesApi.listRoles({ limit: PAGINATION.DEFAULT_LIMIT }).then((res) => {
      if (isMounted && res.data) {
        setRoles(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(user.id, {
      first_name: firstName,
      last_name: lastName,
      role_id: roleId || undefined,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Select
        label="Assigned System / Custom Role"
        value={roleId}
        onChange={(e) => setRoleId(e.target.value)}
        options={roles.map((r) => ({
          value: r.id,
          label: `${r.name.replace("_", " ").toUpperCase()} (${r.is_system ? "System" : "Custom"})`,
        }))}
      />

      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="text-indigo-600 focus:ring-indigo-500 rounded"
        />
        <span>Account Active & Enabled</span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
