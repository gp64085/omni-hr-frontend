"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { usersApi } from "@/features/users/api/users-api";
import { Department } from "@/features/users/types/user-types";
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
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(() => {
    return project.departments?.map((d) => d.id) || project.department_ids || [];
  });
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    let isMounted = true;
    usersApi.listDepartments().then((res) => {
      if (isMounted && res.data) {
        setDepartments(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDept = (id: string) => {
    setSelectedDeptIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(project.id, {
      name,
      code,
      description: description || undefined,
      status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      department_ids: selectedDeptIds,
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

      {/* Department Assignment */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Assigned Departments ({selectedDeptIds.length} selected)
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
          {departments.map((d) => {
            const isChecked = selectedDeptIds.includes(d.id);
            return (
              <label
                key={d.id}
                className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isChecked
                    ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-200"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDept(d.id)}
                  className="text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span className="truncate">{d.name}</span>
              </label>
            );
          })}
        </div>
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
