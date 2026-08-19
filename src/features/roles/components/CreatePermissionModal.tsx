"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Key, Layers } from "lucide-react";
import { SYSTEM_MODULES } from "@/constants";

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { code: string; module: string; description?: string }) => Promise<void>;
  isLoading: boolean;
}

export function CreatePermissionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreatePermissionModalProps) {
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
      setModule("users");
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Permission" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-xs text-slate-400">
          Define a granular security permission to be assigned across enterprise roles.
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

        <ModalFooter onCancel={onClose} submitLabel="Create Permission" isLoading={isLoading} />
      </form>
    </Modal>
  );
}
