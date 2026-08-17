"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UserListTable } from "@/features/users/components/UserListTable";
import { CreateUserModal } from "@/features/users/components/CreateUserModal";
import { EditUserModal } from "@/features/users/components/EditUserModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import { usersApi } from "@/features/users/api/users-api";
import { UserProfile } from "@/types/user";
import { UserCreatePayload, UserUpdatePayload } from "@/features/users/types/user-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PAGINATION, PERMISSIONS } from "@/constants";

export default function EmployeesPage() {
  const { hasPermission } = useAuthStore();
  const { success, error } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await usersApi.listUsers({
          page,
          limit: PAGINATION.DEFAULT_LIMIT,
          search: search || undefined,
        });
        if (isMounted && res.data) {
          setUsers(res.data);
          setTotal(res.meta?.total || res.data.length);
        }
      } catch (err) {
        if (isMounted) {
          error("Failed to load employees", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [page, search, refreshTrigger, error]);

  const handleCreateUser = async (payload: UserCreatePayload) => {
    setActionLoading(true);
    try {
      await usersApi.createUser(payload);
      success("Employee Created", `${payload.first_name} ${payload.last_name} has been added.`);
      setCreateModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to create employee", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, payload: UserUpdatePayload) => {
    setActionLoading(true);
    try {
      await usersApi.updateUser(id, payload);
      success("Employee Updated", "Account settings have been updated.");
      setEditModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to update employee", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await usersApi.deleteUser(deleteTarget.id);
      success(
        "Employee Deleted",
        `${deleteTarget.first_name} ${deleteTarget.last_name} was removed.`
      );
      setDeleteTarget(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Delete Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const canCreate = hasPermission(PERMISSIONS.USERS_WRITE);

  return (
    <AppShell
      title="Employee Directory"
      subtitle={`Manage all ${total} workforce records, roles, and profiles`}
      actions={
        canCreate && (
          <Button
            variant="gradient"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
              setIsLoading(true);
            }}
            placeholder="Search by name or email..."
            className="w-full sm:w-80"
          />

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{users.length}</strong> of{" "}
            <strong className="text-white">{total}</strong> employees
          </div>
        </FilterBar>

        <UserListTable
          users={users}
          isLoading={isLoading}
          onEdit={(u) => {
            setSelectedUser(u);
            setEditModalOpen(true);
          }}
          onDelete={(u) => setDeleteTarget(u)}
        />

        <CreateUserModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateUser}
          isLoading={actionLoading}
        />

        <EditUserModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={selectedUser}
          onSubmit={handleUpdateUser}
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Employee Account"
          description={`Are you sure you want to permanently remove ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This action cannot be undone.`}
          confirmText="Delete Account"
          variant="danger"
          isLoading={actionLoading}
        />
      </div>
    </AppShell>
  );
}
