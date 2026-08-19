"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { ProjectCreatePayload, ProjectStatus } from "../types/project-types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      code,
      description: description || undefined,
      status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
    setName("");
    setCode("");
    setDescription("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!code) {
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 8)
                );
              }
            }}
            placeholder="e.g. NextGen Core Migration"
            required
          />

          <Input
            label="Project Code (Unique)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. NX-CORE"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Project scope and deliverables..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DatePicker label="Start Date" value={startDate} onChange={(val) => setStartDate(val)} />
          <DatePicker
            label="Target End Date"
            value={endDate}
            onChange={(val) => setEndDate(val)}
            minDate={startDate}
          />
        </div>

        <Select
          label="Project Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          options={[
            { value: "active", label: "Active" },
            { value: "on_hold", label: "On Hold" },
            { value: "completed", label: "Completed" },
          ]}
        />

        <ModalFooter onCancel={onClose} submitLabel="Create Project" isLoading={isLoading} />
      </form>
    </Modal>
  );
}
