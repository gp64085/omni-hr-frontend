"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { permissionsApi } from "../api/permissions-api";
import { Permission, RoleCreatePayload } from "../types/role-types";
import { CheckSquare, Square } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RoleCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateRoleModal({ isOpen, onClose, onSubmit, isLoading }: CreateRoleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (isOpen) {
      permissionsApi.listPermissions({ limit: 100 }).then((res) => {
        if (res.data) {
          setPermissions(res.data);
        }
      });
    }
  }, [isOpen]);

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
    await onSubmit({
      name,
      description,
      permission_ids: selectedPermIds,
    });
    setName("");
    setDescription("");
    setSelectedPermIds([]);
  };

  // Group permissions by module
  const groupedPerms: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPerms[p.module]) {
      groupedPerms[p.module] = [];
    }
    groupedPerms[p.module].push(p);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Role" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Role Identifier / Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. payroll_auditor"
          required
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Role responsibilities and access boundary"
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

        <ModalFooter onCancel={onClose} submitLabel="Save Custom Role" isLoading={isLoading} />
      </form>
    </Modal>
  );
}
