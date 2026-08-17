"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { rolesApi } from "../api/roles-api";
import { Permission, Role, RoleUpdatePayload } from "../types/role-types";
import { CheckSquare, Square } from "lucide-react";
import { PAGINATION } from "@/constants";

interface EditRoleFormProps {
  role: Role;
  onClose: () => void;
  onSubmit: (id: string, payload: RoleUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditRoleForm({ role, onClose, onSubmit, isLoading }: EditRoleFormProps) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>(() => {
    return role.permissions?.map((p) => p.id) || role.permission_ids || [];
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    let isMounted = true;
    rolesApi.listPermissions({ limit: PAGINATION.MAX_LIMIT }).then((res) => {
      if (isMounted && res.data) {
        setPermissions(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const togglePerm = (id: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleModule = (modulePerms: Permission[]) => {
    const allSelected = modulePerms.every((p) => selectedPermIds.includes(p.id));
    if (allSelected) {
      const idsToRemove = new Set(modulePerms.map((p) => p.id));
      setSelectedPermIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
    } else {
      const idsToAdd = modulePerms.map((p) => p.id);
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(role.id, {
      name,
      description,
      permission_ids: selectedPermIds,
    });
  };

  const groupedPerms: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPerms[p.module]) {
      groupedPerms[p.module] = [];
    }
    groupedPerms[p.module].push(p);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Role Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={role.is_system}
        required
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Role responsibilities"
      />

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Permission Matrix ({selectedPermIds.length} selected)
        </label>

        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {Object.entries(groupedPerms).map(([moduleName, perms]) => {
            const allChecked = perms.every((p) => selectedPermIds.includes(p.id));

            return (
              <div
                key={moduleName}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Module: {moduleName}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleModule(perms)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {allChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    <span>Select All</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perms.map((p) => {
                    const isChecked = selectedPermIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`p-2 rounded-lg border text-xs flex items-start gap-2 cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-200"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePerm(p.id)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-semibold font-mono text-[11px] text-white">
                            {p.code}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {p.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
