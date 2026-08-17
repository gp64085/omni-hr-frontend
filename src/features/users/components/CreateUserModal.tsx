"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { rolesApi } from "@/features/roles/api/roles-api";
import { usersApi } from "@/features/users/api/users-api";
import { Role } from "@/features/roles/types/role-types";
import { Department, Designation, UserCreatePayload } from "../types/user-types";
import { UserProfile } from "@/types/user";

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
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [managers, setManagers] = useState<UserProfile[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.all([
        rolesApi.listRoles().catch(() => ({ data: [] })),
        usersApi.listDepartments().catch(() => ({ data: [] })),
        usersApi.listDesignations().catch(() => ({ data: [] })),
        usersApi.listUsers({ limit: 100 }).catch(() => ({ data: [] })),
      ]).then(([rolesRes, deptsRes, desigsRes, usersRes]) => {
        if (isMounted) {
          if (rolesRes.data) {
            setRoles(rolesRes.data);
            if (rolesRes.data.length > 0 && !roleId) {
              setRoleId(rolesRes.data[0].id);
            }
          }
          if (deptsRes.data) setDepartments(deptsRes.data);
          if (desigsRes.data) setDesignations(desigsRes.data);
          if (usersRes.data) setManagers(usersRes.data);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, roleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role_id: roleId || undefined,
      department_id: departmentId || undefined,
      designation_id: designationId || undefined,
      manager_id: managerId || undefined,
    });
    // Reset
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setDepartmentId("");
    setDesignationId("");
    setManagerId("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Employee Account"
      description="Provision workforce profile with designated role access, department assignment, job title, and reporting hierarchy."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned System Role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            options={roles.map((r) => ({
              value: r.id,
              label: `${r.name.replace("_", " ")} ${r.is_system ? "(System)" : "(Custom)"}`,
            }))}
          />

          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[
              { value: "", label: "Select Department (Optional)" },
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
              { value: "", label: "Select Job Title (Optional)" },
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
              { value: "", label: "Select Manager (Optional)" },
              ...managers.map((m) => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name} (${m.role?.name?.replace("_", " ") || "Member"})`,
              })),
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Create Employee Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
