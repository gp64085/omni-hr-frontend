"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RolesListTable } from "@/features/roles/components/RolesListTable";
import { CreateRoleModal } from "@/features/roles/components/CreateRoleModal";
import { EditRoleModal } from "@/features/roles/components/EditRoleModal";
import { PermissionsCatalog } from "@/features/roles/components/PermissionsCatalog";
import { CreatePermissionModal } from "@/features/roles/components/CreatePermissionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ShieldCheck, Plus, Key } from "lucide-react";
import { rolesApi } from "@/features/roles/api/roles-api";
import {
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
  PermissionCreatePayload,
} from "@/features/roles/types/role-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PAGINATION, PERMISSIONS } from "@/constants";

export default function RolesPage() {
  const { hasPermission } = useAuthStore();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [createPermModalOpen, setCreatePermModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchRoles = async () => {
      try {
        const res = await rolesApi.listRoles({ limit: PAGINATION.DEFAULT_LIMIT });
        if (isMounted && res.data) {
          setRoles(res.data);
        }
      } catch (err) {
        if (isMounted) {
          error("Failed to load system roles", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRoles();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, error]);

  const handleCreateRole = async (payload: RoleCreatePayload) => {
    setActionLoading(true);
    try {
      await rolesApi.createRole(payload);
      success("Role Created", `Custom role '${payload.name}' has been created.`);
      setCreateRoleModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to create role", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePermission = async (payload: PermissionCreatePayload) => {
    setActionLoading(true);
    try {
      await rolesApi.createPermission(payload);
      success("Permission Registered", `Created system permission '${payload.code}'.`);
      setCreatePermModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Creation Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, payload: RoleUpdatePayload) => {
    setActionLoading(true);
    try {
      await rolesApi.updateRole(id, payload);
      success("Role Updated", "Role permissions and configuration updated.");
      setEditModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to update role", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await rolesApi.deleteRole(deleteTarget.id);
      success("Role Deleted", `Custom role '${deleteTarget.name}' was removed.`);
      setDeleteTarget(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Delete Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
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
          <div className="flex items-center gap-2">
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
                className="flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register Permission</span>
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
              setEditModalOpen(true);
            }}
            onDelete={(r) => setDeleteTarget(r)}
          />
        ) : (
          <PermissionsCatalog
            refreshTrigger={refreshTrigger}
            onOpenCreateModal={() => setCreatePermModalOpen(true)}
          />
        )}

        <CreateRoleModal
          isOpen={createRoleModalOpen}
          onClose={() => setCreateRoleModalOpen(false)}
          onSubmit={handleCreateRole}
          isLoading={actionLoading}
        />

        <CreatePermissionModal
          isOpen={createPermModalOpen}
          onClose={() => setCreatePermModalOpen(false)}
          onSubmit={handleCreatePermission}
          isLoading={actionLoading}
        />

        <EditRoleModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          role={selectedRole}
          onSubmit={handleUpdateRole}
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Custom Role"
          description={`Are you sure you want to permanently delete custom role '${deleteTarget?.name}'? Users assigned to this role must be reassigned.`}
          confirmText="Delete Role"
          variant="danger"
          isLoading={actionLoading}
        />
      </div>
    </AppShell>
  );
}
