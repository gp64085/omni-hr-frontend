"use client";

import React, { useState } from "react";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SYSTEM_MODULES } from "@/constants";

export interface CreatePermissionFormProps {
  onClose: () => void;
  onSubmit: (payload: { code: string; module: string; description?: string }) => Promise<void>;
  isLoading: boolean;
}

export function CreatePermissionForm({
  onClose,
  onSubmit,
  isLoading,
}: CreatePermissionFormProps) {
  const [code, setCode] = useState("");
  const [module, setModule] = useState("users");
  const [customModule, setCustomModule] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const availableModules = SYSTEM_MODULES.filter((m) => m !== "all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim().toLowerCase();
    const finalModule = module === "custom" ? customModule.trim().toLowerCase() : module;

    if (!trimmedCode) {
      setError("Permission code is required (e.g., 'reports:view').");
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
      await onSubmit({
        code: trimmedCode,
        module: finalModule,
        description: description.trim() || undefined,
      });
      setCode("");
      setDescription("");
      setCustomModule("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create permission");
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
        placeholder="e.g. payroll:export, attendance:manage"
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
        submitLabel="Register Permission"
        isLoading={isLoading}
      />
    </form>
  );
}
