"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { rolesApi } from "@/features/roles/api/roles-api";
import { usersApi } from "@/features/users/api/users-api";
import { Role } from "@/features/roles/types/role-types";
import { Department, Designation, UserUpdatePayload } from "../types/user-types";
import { UserProfile } from "@/types/user";

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
  const [departmentId, setDepartmentId] = useState(user.department?.id || "");
  const [designationId, setDesignationId] = useState(user.designation?.id || "");
  const [managerId, setManagerId] = useState(user.manager_id || "");
  const [isActive, setIsActive] = useState(user.is_active);

  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [managers, setManagers] = useState<UserProfile[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      rolesApi.listRoles().catch(() => ({ data: [] })),
      usersApi.listDepartments().catch(() => ({ data: [] })),
      usersApi.listDesignations().catch(() => ({ data: [] })),
      usersApi.listUsers({ limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([rolesRes, deptsRes, desigsRes, usersRes]) => {
      if (isMounted) {
        if (rolesRes.data) setRoles(rolesRes.data);
        if (deptsRes.data) setDepartments(deptsRes.data);
        if (desigsRes.data) setDesignations(desigsRes.data);
        if (usersRes.data) {
          // Filter out the user themself from being their own manager
          setManagers(usersRes.data.filter((u) => u.id !== user.id));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(user.id, {
      first_name: firstName,
      last_name: lastName,
      role_id: roleId || undefined,
      department_id: departmentId || undefined,
      designation_id: designationId || undefined,
      manager_id: managerId || undefined,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Assigned System / Custom Role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          options={roles.map((r) => ({
            value: r.id,
            label: `${r.name.replace("_", " ").toUpperCase()} (${r.is_system ? "System" : "Custom"})`,
          }))}
        />

        <Select
          label="Department"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          options={[
            { value: "", label: "No Department Assigned" },
            ...departments.map((d) => ({
              value: d.id,
              label: d.name,
            })),
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Designation / Job Title"
          value={designationId}
          onChange={(e) => setDesignationId(e.target.value)}
          options={[
            { value: "", label: "No Designation Assigned" },
            ...designations.map((d) => ({
              value: d.id,
              label: d.title,
            })),
          ]}
        />

        <Select
          label="Reporting Manager"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          options={[
            { value: "", label: "No Reporting Manager" },
            ...managers.map((m) => ({
              value: m.id,
              label: `${m.first_name} ${m.last_name} (${m.role?.name?.replace("_", " ") || "Member"})`,
            })),
          ]}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
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
