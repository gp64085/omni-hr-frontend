"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PermissionCreatePayload } from "../types/role-types";
import { SYSTEM_MODULES } from "@/constants";

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PermissionCreatePayload) => Promise<void>;
  isLoading: boolean;
}

const AVAILABLE_MODULES = SYSTEM_MODULES.filter((m) => m !== "all");

export function CreatePermissionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreatePermissionModalProps) {
  const [code, setCode] = useState("");
  const [module, setModule] = useState<string>(AVAILABLE_MODULES[0] || "users");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      code: code.trim().toLowerCase(),
      module,
      description: description.trim() || undefined,
    });
    setCode("");
    setDescription("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register System Permission"
      description="Define a new granular access control privilege code and map it to a target subsystem module."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Permission Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. analytics:export"
          required
        />

        <Select
          label="Target System Module"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          options={AVAILABLE_MODULES.map((m) => ({
            value: m,
            label: m.toUpperCase(),
          }))}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe what access or operation this permission enables..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Register Permission
          </Button>
        </div>
      </form>
    </Modal>
  );
}
