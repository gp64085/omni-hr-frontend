"use client";

import React from "react";
import { Role } from "../types/role-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Edit2, Trash2, Shield, Key } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

interface RolesListTableProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RolesListTable({ roles, isLoading, onEdit, onDelete }: RolesListTableProps) {
  const { hasPermission } = useAuthStore();
  const canWrite = hasPermission("roles:write");
  const canDelete = hasPermission("roles:delete");

  const columns: Column<Role>[] = [
    {
      header: "Role Identifier",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight capitalize">
              {r.name.replace("_", " ")}
            </div>
            <div className="font-mono text-[10px] text-slate-500">{r.name}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      cell: (r) => (
        <span className="text-slate-300 max-w-xs truncate block">
          {r.description || "No description specified"}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (r) => (
        <StatusBadge
          status={r.is_system ? "System Role" : "Custom Role"}
          variant={r.is_system ? "system" : "custom"}
        />
      ),
    },
    {
      header: "Permissions Assigned",
      cell: (r) => {
        const permCount = r.permissions?.length || r.permission_ids?.length || 0;
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
            <Key className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold">{permCount}</span>
            <span className="text-slate-400 text-[10px]">privileges</span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          {canWrite && (
            <button
              onClick={() => onEdit(r)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Edit Role & Permissions"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && !r.is_system && onDelete && (
            <button
              onClick={() => onDelete(r)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Delete Custom Role"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={roles}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      loadingMessage="Loading RBAC roles..."
      emptyState={{
        icon: Shield,
        title: "No roles found",
        description: "Configure system roles above.",
      }}
    />
  );
}
