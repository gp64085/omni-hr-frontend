"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UserListTable } from "@/features/users/components/UserListTable";
import { CreateUserModal } from "@/features/users/components/CreateUserModal";
import { EditUserModal } from "@/features/users/components/EditUserModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import { UserProfile } from "@/types/user";
import { UserCreatePayload, UserUpdatePayload } from "@/features/users/types/user-types";
import { useAuthStore } from "@/store/use-auth-store";
import { PAGINATION, PERMISSIONS } from "@/constants";
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/features/users/hooks/use-users-queries";

export default function EmployeesPage() {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Queries
  const { data: usersData, isLoading } = useUsersQuery({
    page,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: search || undefined,
  });

  const users = usersData?.data || [];
  const total = usersData?.meta?.total || users.length;

  // Mutations
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const handleCreateUser = async (payload: UserCreatePayload) => {
    await createMutation.mutateAsync(payload);
    setCreateModalOpen(false);
  };

  const handleUpdateUser = async (id: string, payload: UserUpdatePayload) => {
    await updateMutation.mutateAsync({ id, payload });
    setEditModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
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
          isLoading={createMutation.isPending}
        />

        <EditUserModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={selectedUser}
          onSubmit={handleUpdateUser}
          isLoading={updateMutation.isPending}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Employee Account"
          description={`Are you sure you want to permanently remove ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This action cannot be undone.`}
          confirmText="Delete Account"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
