"use client";

import React from "react";
import { TimePicker } from "@/components/ui/TimePicker";
import { TaskItem } from "../utils/timesheet-form-utils";
import { Trash2 } from "lucide-react";

interface TaskRowItemProps {
  task: TaskItem;
  canRemove: boolean;
  onUpdateSummary: (summary: string) => void;
  onUpdateTime: (hours: number, minutes: number) => void;
  onRemove: () => void;
}

export function TaskRowItem({
  task,
  canRemove,
  onUpdateSummary,
  onUpdateTime,
  onRemove,
}: TaskRowItemProps) {
  const timeValue = `${String(task.hours || 0).padStart(2, "0")}:${String(task.minutes || 0).padStart(2, "0")}`;

  const handleTimeChange = (newTime: string) => {
    if (!newTime || !newTime.includes(":")) return;
    const [hStr, mStr] = newTime.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (!isNaN(h) && !isNaN(m)) {
      onUpdateTime(h, m);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
      <div className="flex-1">
        <input
          type="text"
          required
          value={task.summary}
          onChange={(e) => onUpdateSummary(e.target.value)}
          placeholder="e.g. Implemented OAuth tokens & fixed unit tests..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <TimePicker value={timeValue} onChange={handleTimeChange} />

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
