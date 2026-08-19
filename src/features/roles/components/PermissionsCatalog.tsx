"use client";

import React, { useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Key, Plus, Pencil } from "lucide-react";
import { SYSTEM_MODULES, PAGINATION, PERMISSIONS } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";
import { usePermissionsQuery } from "../hooks/use-roles-queries";
import { Permission } from "../types/role-types";

interface PermissionsCatalogProps {
  onOpenCreateModal?: () => void;
  onEditPermission?: (permission: Permission) => void;
}

export function PermissionsCatalog({
  onOpenCreateModal,
  onEditPermission,
}: PermissionsCatalogProps) {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const canWrite = hasPermission(PERMISSIONS.ROLES_WRITE);

  const { data: permissions = [], isLoading } = usePermissionsQuery({
    limit: PAGINATION.MAX_LIMIT,
    search: search || undefined,
    module: selectedModule !== "all" ? selectedModule : undefined,
  });

  return (
    <div className="space-y-4">
      {/* Search & Module filter bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <SearchInput
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search by code or description..."
          className="w-full lg:w-80 shrink-0"
        />

        {/* Module Chips Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SYSTEM_MODULES.map((m) => {
            const isSelected = selectedModule === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-750/50"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading catalog...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
            <Key className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-white">No Permissions Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || selectedModule !== "all"
              ? "No permissions matched your search criteria."
              : "Register your first custom permission to use across security policies."}
          </p>
          {canWrite && onOpenCreateModal && (
            <Button variant="secondary" size="sm" onClick={onOpenCreateModal} className="mt-2">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create New Permission</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissions.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white font-mono truncate">{p.code}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 uppercase">
                      {p.module}
                    </span>
                    {canWrite && onEditPermission && (
                      <button
                        type="button"
                        onClick={() => onEditPermission(p)}
                        className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                        title={`Edit permission ${p.code}`}
                        aria-label={`Edit permission ${p.code}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {p.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
