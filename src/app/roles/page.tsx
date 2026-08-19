"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RolesListTable } from "@/features/roles/components/RolesListTable";
import { CreateRoleModal } from "@/features/roles/components/CreateRoleModal";
import { CreatePermissionModal } from "@/features/roles/components/CreatePermissionModal";
import { EditPermissionModal } from "@/features/roles/components/EditPermissionModal";
import { EditRoleModal } from "@/features/roles/components/EditRoleModal";
import { PermissionsCatalog } from "@/features/roles/components/PermissionsCatalog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ShieldCheck, Plus, Key } from "lucide-react";
import {
  Permission,
  PermissionUpdatePayload,
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
} from "@/features/roles/types/role-types";
import { useAuthStore } from "@/store/use-auth-store";
import { PAGINATION, PERMISSIONS } from "@/constants";
import {
  useRolesQuery,
  useCreateRoleMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/features/roles/hooks/use-roles-queries";

export default function RolesPage() {
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState("roles");

  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [createPermModalOpen, setCreatePermModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [editPermModalOpen, setEditPermModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Queries
  const { data: roles = [], isLoading } = useRolesQuery({ limit: PAGINATION.DEFAULT_LIMIT });

  // Mutations
  const createRoleMutation = useCreateRoleMutation();
  const createPermMutation = useCreatePermissionMutation();
  const updatePermMutation = useUpdatePermissionMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();

  const handleCreateRole = async (payload: RoleCreatePayload) => {
    await createRoleMutation.mutateAsync(payload);
    setCreateRoleModalOpen(false);
  };

  const handleCreatePermission = async (payload: {
    code: string;
    module: string;
    description?: string;
  }) => {
    await createPermMutation.mutateAsync(payload);
    setCreatePermModalOpen(false);
  };

  const handleUpdatePermission = async (id: string, payload: PermissionUpdatePayload) => {
    await updatePermMutation.mutateAsync({ id, payload });
    setEditPermModalOpen(false);
  };

  const handleUpdateRole = async (id: string, payload: RoleUpdatePayload) => {
    await updateRoleMutation.mutateAsync({ id, payload });
    setEditRoleModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const canWrite = hasPermission(PERMISSIONS.ROLES_WRITE);

  const tabs = [
    { id: "roles", label: "Roles & Access Policies", icon: ShieldCheck, count: roles.length },
    { id: "permissions", label: "Permissions Catalog", icon: Key },
  ];

  return (
    <AppShell
      title="Roles & Access Control (RBAC)"
      subtitle="Configure enterprise security roles and granular permission policies"
      actions={
        canWrite && (
          <div>
            {activeTab === "roles" ? (
              <Button
                variant="gradient"
                onClick={() => setCreateRoleModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={() => setCreatePermModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Permission</span>
              </Button>
            )}
          </div>
        )
      }
    >
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "roles" ? (
          <RolesListTable
            roles={roles}
            isLoading={isLoading}
            onEdit={(r) => {
              setSelectedRole(r);
              setEditRoleModalOpen(true);
            }}
            onDelete={(r) => setDeleteTarget(r)}
          />
        ) : (
          <PermissionsCatalog
            onOpenCreateModal={() => setCreatePermModalOpen(true)}
            onEditPermission={(p) => {
              setSelectedPermission(p);
              setEditPermModalOpen(true);
            }}
          />
        )}

        <CreateRoleModal
          isOpen={createRoleModalOpen}
          onClose={() => setCreateRoleModalOpen(false)}
          onSubmit={handleCreateRole}
          isLoading={createRoleMutation.isPending}
        />

        <CreatePermissionModal
          isOpen={createPermModalOpen}
          onClose={() => setCreatePermModalOpen(false)}
          onSubmit={handleCreatePermission}
          isLoading={createPermMutation.isPending}
        />

        <EditPermissionModal
          isOpen={editPermModalOpen}
          onClose={() => setEditPermModalOpen(false)}
          permission={selectedPermission}
          onSubmit={handleUpdatePermission}
          isLoading={updatePermMutation.isPending}
        />

        <EditRoleModal
          isOpen={editRoleModalOpen}
          onClose={() => setEditRoleModalOpen(false)}
          role={selectedRole}
          onSubmit={handleUpdateRole}
          isLoading={updateRoleMutation.isPending}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Custom Role"
          description={`Are you sure you want to permanently delete custom role '${deleteTarget?.name}'? Users assigned to this role must be reassigned.`}
          confirmText="Delete Role"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
