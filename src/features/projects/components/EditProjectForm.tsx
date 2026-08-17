"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Project, ProjectStatus, ProjectUpdatePayload } from "../types/project-types";

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onSubmit: (id: string, payload: ProjectUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function EditProjectForm({ project, onClose, onSubmit, isLoading }: EditProjectFormProps) {
  const [name, setName] = useState(project.name || "");
  const [code, setCode] = useState(project.code || "");
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status || "active");
  const [startDate, setStartDate] = useState(project.start_date || "");
  const [endDate, setEndDate] = useState(project.end_date || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(project.id, {
      name,
      code,
      description: description || undefined,
      status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Project Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
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
