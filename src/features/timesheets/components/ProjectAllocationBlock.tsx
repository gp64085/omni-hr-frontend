"use client";

import React from "react";
import { Select } from "@/components/ui/Select";
import { TaskRowItem } from "./TaskRowItem";
import {
  ProjectBlock,
  TaskItem,
  computeBlockMinutes,
  formatHoursMinutes,
  createEmptyTask,
} from "../utils/timesheet-form-utils";
import { Plus, Trash2 } from "lucide-react";

interface ProjectOption {
  value: string;
  label: string;
}

interface ProjectAllocationBlockProps {
  block: ProjectBlock;
  blockIndex: number;
  canRemoveBlock: boolean;
  projectOptions: ProjectOption[];
  onUpdateField: (field: "projectId" | "isBillable", value: string | boolean) => void;
  onRemoveBlock: () => void;
  onUpdateTasks: (tasks: TaskItem[]) => void;
}

export function ProjectAllocationBlock({
  block,
  blockIndex,
  canRemoveBlock,
  projectOptions,
  onUpdateField,
  onRemoveBlock,
  onUpdateTasks,
}: ProjectAllocationBlockProps) {
  const projectMinutes = computeBlockMinutes(block);

  const handleAddTask = () => {
    onUpdateTasks([...block.tasks, createEmptyTask()]);
  };

  const handleRemoveTask = (taskId: string) => {
    if (block.tasks.length === 1) return;
    onUpdateTasks(block.tasks.filter((t) => t.id !== taskId));
  };

  const handleUpdateSummary = (taskId: string, summary: string) => {
    onUpdateTasks(block.tasks.map((t) => (t.id === taskId ? { ...t, summary } : t)));
  };

  const handleUpdateTime = (taskId: string, hours: number, minutes: number) => {
    onUpdateTasks(block.tasks.map((t) => (t.id === taskId ? { ...t, hours, minutes } : t)));
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 transition-all">
      {/* Project Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center">
            {blockIndex + 1}
          </span>
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            Project Allocation
          </span>
        </div>

        {canRemoveBlock && (
          <button
            type="button"
            onClick={onRemoveBlock}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove project block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Project Selector & Subtotal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <Select
            label="Assigned Project"
            options={projectOptions}
            value={block.projectId || projectOptions[0]?.value || ""}
            onChange={(e) => onUpdateField("projectId", e.target.value)}
            required
          />
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Subtotal:</span>
          <span className="font-mono font-bold text-indigo-400 text-sm">
            {formatHoursMinutes(projectMinutes)}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Task Activity Description</span>
          <span>Time (HH:MM)</span>
        </div>

        {block.tasks.map((task) => (
          <TaskRowItem
            key={task.id}
            task={task}
            canRemove={block.tasks.length > 1}
            onUpdateSummary={(summary) => handleUpdateSummary(task.id, summary)}
            onUpdateTime={(hours, minutes) => handleUpdateTime(task.id, hours, minutes)}
            onRemove={() => handleRemoveTask(task.id)}
          />
        ))}

        <button
          type="button"
          onClick={handleAddTask}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task Description</span>
        </button>
      </div>
    </div>
  );
}
