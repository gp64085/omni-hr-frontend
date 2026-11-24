"use client";

import React, { useState } from "react";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SYSTEM_MODULES } from "@/constants";
import { Permission, PermissionUpdatePayload } from "../types/role-types";

export interface EditPermissionFormProps {
  permission: Permission;
  onClose: () => void;
  onSubmit: (id: string, payload: PermissionUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditPermissionForm({
  permission,
  onClose,
  onSubmit,
  isLoading,
}: EditPermissionFormProps) {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update permission");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      <Input
        label="Permission Code (Key)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. payroll:export"
        required
      />

      <div className="space-y-3">
        <Select
          label="System Module / Domain"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          options={[
            ...availableModules.map((m) => ({
              value: m,
              label: m.toUpperCase(),
            })),
            { value: "custom", label: "+ Custom / New Domain" },
          ]}
        />

        {module === "custom" && (
          <Input
            label="Custom Module Identifier"
            value={customModule}
            onChange={(e) => setCustomModule(e.target.value)}
            placeholder="e.g. integrations, compliance"
            required
          />
        )}
      </div>

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Explains what this grant allows"
      />

      <ModalFooter
        onCancel={onClose}
        submitLabel="Save Changes"
        isLoading={isLoading}
      />
    </form>
  );
}
