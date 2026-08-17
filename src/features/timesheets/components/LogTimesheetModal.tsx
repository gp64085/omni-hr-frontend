"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeSelect } from "@/components/ui/TimeSelect";
import { projectsApi } from "@/features/projects/api/projects-api";
import { Project } from "@/features/projects/types/project-types";
import { TimesheetEntryCreatePayload } from "../types/timesheet-types";
import { TIMESHEET_CONSTANTS } from "@/constants";
import { getTodayDateString } from "@/lib/date-utils";

interface LogTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TimesheetEntryCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export function LogTimesheetModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: LogTimesheetModalProps) {
  const [projectId, setProjectId] = useState("");
  const [workDate, setWorkDate] = useState(getTodayDateString);
  const [hoursSpent, setHoursSpent] = useState(String(TIMESHEET_CONSTANTS.DEFAULT_DAILY_HOURS));
  const [activitySummary, setActivitySummary] = useState("");
  const [isBillable, setIsBillable] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      projectsApi.listProjects().then((res) => {
        if (isMounted && res.data) {
          setProjects(res.data);
          if (res.data.length > 0 && !projectId) {
            setProjectId(res.data[0].id);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      project_id: projectId || undefined,
      work_date: workDate,
      hours_spent: parseFloat(hoursSpent) || 0,
      activity_summary: activitySummary,
      is_billable: isBillable,
    });
    setActivitySummary("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Daily Work Entry"
      description="Record project tasks, work summary, and billable duration."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project Assignment"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          options={projects.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.code})`,
          }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DatePicker
            label="Work Date"
            value={workDate}
            onChange={(val) => setWorkDate(val)}
            required
          />

          <TimeSelect
            label="Hours Spent"
            value={hoursSpent}
            onChange={(val) => setHoursSpent(val)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Work Summary & Activity Description
          </label>
          <textarea
            value={activitySummary}
            onChange={(e) => setActivitySummary(e.target.value)}
            rows={3}
            placeholder="Detailed summary of tasks accomplished, PRs merged, or standup updates..."
            required
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
            className="text-indigo-600 focus:ring-indigo-500 rounded"
          />
          <span>Billable Client Work</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Save Timesheet Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
