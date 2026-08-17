"use client";

import React from "react";
import { UserProfile } from "@/types/user";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Edit2, Trash2, Mail, Shield, Building2, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

interface UserListTableProps {
  users: UserProfile[];
  isLoading: boolean;
  onEdit: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
}

export function UserListTable({ users, isLoading, onEdit, onDelete }: UserListTableProps) {
  const { hasPermission, user: currentUser } = useAuthStore();
  const canWrite = hasPermission("users:write");
  const canDelete = hasPermission("users:delete");

  const columns: Column<UserProfile>[] = [
    {
      header: "Employee",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
            {u.first_name?.[0]}
            {u.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">
              {u.first_name} {u.last_name}
            </div>
            <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5 truncate">
              <Mail className="w-3 h-3 shrink-0" />
              <span>{u.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Department & Title",
      cell: (u) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <span>{u.designation?.title || "Staff Member"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>{u.department?.name || "Unassigned"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role / Access",
      cell: (u) => {
        const roleName = u.role?.name || "employee";
        return (
          <StatusBadge
            status={roleName.replace("_", " ")}
            variant={roleName === "super_admin" ? "system" : "custom"}
          />
        );
      },
    },
    {
      header: "Status",
      cell: (u) => (
        <StatusBadge
          status={u.is_active ? "Active" : "Inactive"}
          variant={u.is_active ? "active" : "inactive"}
        />
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (u) => {
        const isSelf = currentUser?.id === u.id;
        return (
          <div className="flex items-center justify-end gap-2">
            {canWrite && (
              <button
                onClick={() => onEdit(u)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Edit User"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && !isSelf && onDelete && (
              <button
                onClick={() => onDelete(u)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Delete User"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      keyExtractor={(u) => u.id}
      isLoading={isLoading}
      loadingMessage="Loading workforce directory..."
      emptyState={{
        icon: Shield,
        title: "No employees found",
        description: "Try adjusting your search query or filters.",
      }}
    />
  );
}
