"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Key, Layers } from "lucide-react";
import { SYSTEM_MODULES } from "@/constants";
import { Permission, PermissionUpdatePayload } from "../types/role-types";

interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSubmit: (id: string, payload: PermissionUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

interface EditPermissionFormProps {
  permission: Permission;
  onClose: () => void;
  onSubmit: (id: string, payload: PermissionUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

function EditPermissionForm({ permission, onClose, onSubmit, isLoading }: EditPermissionFormProps) {
  const availableModules = SYSTEM_MODULES.filter((m) => m !== "all");
  const isKnownModule = availableModules.includes(
    permission.module as (typeof availableModules)[number]
  );

  const [code, setCode] = useState(permission.code);
  const [module, setModule] = useState(isKnownModule ? permission.module : "custom");
  const [customModule, setCustomModule] = useState(isKnownModule ? "" : permission.module);
  const [description, setDescription] = useState(permission.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim().toLowerCase();
    const finalModule = module === "custom" ? customModule.trim().toLowerCase() : module;

    if (!trimmedCode) {
      setError("Permission code is required.");
      return;
    }
    if (!trimmedCode.includes(":") && !trimmedCode.includes("_")) {
      setError(
        "Permission code must follow standard naming convention like 'module:action' (e.g. 'leaves:approve')."
      );
      return;
    }
    if (!finalModule) {
      setError("Please select or enter a module category.");
      return;
    }

    try {
      await onSubmit(permission.id, {
        code: trimmedCode,
        module: finalModule,
        description: description.trim() || undefined,
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xs text-slate-400">
        Modify granular permission definitions and capability scope.
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <Input
        label="Permission Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. reports:export or payroll:approve"
        icon={Key}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Module Category</label>
        <div className="grid grid-cols-1 gap-2">
          <Select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            options={[
              ...availableModules.map((m) => ({
                value: m,
                label: `${m.toUpperCase()} Module`,
              })),
              { value: "custom", label: "+ Other / Custom Module" },
            ]}
          />
          {module === "custom" && (
            <Input
              label="Custom Module Name"
              value={customModule}
              onChange={(e) => setCustomModule(e.target.value)}
              placeholder="e.g. billing or integrations"
              icon={Layers}
              required
            />
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          Description <span className="text-slate-500 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Explain what capability this permission grants..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <ModalFooter onCancel={onClose} submitLabel="Save Permission" isLoading={isLoading} />
    </form>
  );
}

export function EditPermissionModal({
  isOpen,
  onClose,
  permission,
  onSubmit,
  isLoading,
}: EditPermissionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Permission Policy" maxWidth="md">
      {permission ? (
        <EditPermissionForm
          key={permission.id}
          permission={permission}
          onClose={onClose}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      ) : null}
    </Modal>
  );
}
