"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Alert } from "@/components/ui/Alert";
import { ProjectAllocationBlock } from "./ProjectAllocationBlock";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-queries";
import {
  TimesheetEntry,
  TimesheetEntryCreatePayload,
  TimesheetEntryUpdatePayload,
} from "../types/timesheet-types";
import {
  ProjectBlock,
  TaskItem,
  createInitialProjectBlock,
  parseActivitySummaryToProjectBlocks,
  computeTotalMinutes,
  formatHoursMinutes,
} from "../utils/timesheet-form-utils";
import { getTodayDateString, formatMinutesToHHMM } from "@/lib/date-utils";
import { subDays, format } from "date-fns";
import { Clock, Briefcase, CheckCircle2, Layers, AlertCircle, RotateCcw } from "lucide-react";

interface LogTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TimesheetEntryCreatePayload) => Promise<void>;
  onUpdate?: (id: string, payload: TimesheetEntryUpdatePayload) => Promise<void>;
  isLoading: boolean;
  defaultWorkDate?: string;
  existingEntries?: TimesheetEntry[];
  editingEntry?: TimesheetEntry | null;
}

interface LogTimesheetFormProps {
  onClose: () => void;
  onSubmit: (payload: TimesheetEntryCreatePayload) => Promise<void>;
  onUpdate?: (id: string, payload: TimesheetEntryUpdatePayload) => Promise<void>;
  isLoading: boolean;
  defaultWorkDate?: string;
  existingEntries?: TimesheetEntry[];
  editingEntry?: TimesheetEntry | null;
}

function LogTimesheetForm({
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  defaultWorkDate,
  existingEntries = [],
  editingEntry = null,
}: LogTimesheetFormProps) {
  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsQuery();

  const [workDate, setWorkDate] = useState(
    () => editingEntry?.work_date || defaultWorkDate || getTodayDateString()
  );

  const [projectBlocks, setProjectBlocks] = useState<ProjectBlock[]>(() => {
    if (editingEntry) {
      const fallbackPid = editingEntry.project_id || projects[0]?.id || "";
      return parseActivitySummaryToProjectBlocks(
        editingEntry.activity_summary,
        fallbackPid,
        editingEntry.total_minutes_spent
      );
    }
    return [createInitialProjectBlock(projects[0]?.id || "")];
  });

  const handleAddProjectBlock = () => {
    const defaultProjId = projects[0]?.id || "";
    const selectedProjectIds = projectBlocks
      .map((b) => b.projectId || defaultProjId)
      .filter(Boolean);
    const nextAvailableProject = projects.find((p) => !selectedProjectIds.includes(p.id));
    const nextProjId = nextAvailableProject ? nextAvailableProject.id : defaultProjId;
    setProjectBlocks((prev) => [...prev, createInitialProjectBlock(nextProjId)]);
  };

  const handleRemoveProjectBlock = (blockId: string) => {
    if (projectBlocks.length === 1) return;
    setProjectBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleUpdateBlockField = (
    blockId: string,
    field: "projectId" | "isBillable",
    value: string | boolean
  ) => {
    setProjectBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)));
  };

  const handleUpdateBlockTasks = (blockId: string, tasks: TaskItem[]) => {
    setProjectBlocks((prevBlocks) =>
      prevBlocks.map((block) => (block.id === blockId ? { ...block, tasks } : block))
    );
  };

  const totalMinutesAll = computeTotalMinutes(projectBlocks);
  const totalHoursDecimal = totalMinutesAll / 60;
  const isOver24Hours = totalHoursDecimal > 24;
  const todayStr = getTodayDateString();
  const minAllowedDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const isFutureDate = workDate > todayStr;
  const isOlderThan7Days = workDate < minAllowedDate;
  const existingEntryForSelectedDate = existingEntries.find(
    (entry) => entry.work_date === workDate && (!editingEntry || entry.id !== editingEntry.id)
  );

  const isRejectedMode = editingEntry?.status === "rejected";
  const isEditMode = Boolean(editingEntry);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      isOver24Hours ||
      totalMinutesAll <= 0 ||
      isFutureDate ||
      isOlderThan7Days ||
      Boolean(existingEntryForSelectedDate)
    )
      return;

    const allocations = projectBlocks
      .map((block) => {
        const effectiveProjectId = block.projectId || projects[0]?.id || "";
        const validTasks = block.tasks
          .filter((task) => task.summary.trim())
          .map((task) => {
            const taskHours = Math.floor(Number(task.hours) || 0);
            const taskMinutes = Math.round(Number(task.minutes) || 0);
            const minutesSpent = taskHours * 60 + taskMinutes;
            return {
              summary: task.summary.trim(),
              hours: taskHours,
              minutes: taskMinutes,
              formatted_time: formatHoursMinutes(minutesSpent),
            };
          });

        const projTotalMins = validTasks.reduce(
          (totalMinutes, task) => totalMinutes + (task.hours * 60 + (task.minutes || 0)),
          0
        );
        const projectObj = projects.find((project) => project.id === effectiveProjectId);

        return {
          project_id: effectiveProjectId || undefined,
          project_name: projectObj ? `${projectObj.name} (${projectObj.code})` : undefined,
          tasks: validTasks,
          total_minutes_spent: projTotalMins,
        };
      })
      .filter((block) => block.tasks.length > 0);

    if (allocations.length === 0) return;

    const totalValidMins = allocations.reduce((sumMinutes, block) => {
      return sumMinutes + block.total_minutes_spent;
    }, 0);

    const singlePayload: TimesheetEntryCreatePayload = {
      project_id: allocations[0]?.project_id,
      work_date: workDate,
      total_minutes_spent: totalValidMins,
      activity_summary: allocations,
    };

    if (editingEntry && onUpdate) {
      await onUpdate(editingEntry.id, singlePayload);
    } else {
      await onSubmit(singlePayload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rejection Notice Banner */}
      {isRejectedMode && editingEntry?.rejection_reason && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-200 block text-sm">
              Manager Feedback / Rejection Reason:
            </span>
            <p className="mt-1 leading-relaxed text-rose-300">{editingEntry.rejection_reason}</p>
            <p className="mt-2 text-rose-400/80 italic text-[11px]">
              Make the required updates below and submit to send this timesheet back to your manager
              for review.
            </p>
          </div>
        </div>
      )}

      {/* Work Date Field */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">Work Date</h4>
          </div>
        </div>
        <div className="w-full sm:w-56">
          <DatePicker
            label=""
            value={workDate}
            onChange={(val) => setWorkDate(val)}
            minDate={minAllowedDate}
            maxDate={todayStr}
            required
          />
        </div>
      </div>

      {/* Validation Warnings */}
      {existingEntryForSelectedDate && (
        <Alert variant="error">
          A timesheet entry has already been logged for{" "}
          <span className="font-semibold text-rose-200">{workDate}</span> (Status:{" "}
          <span className="font-semibold capitalize text-rose-200">
            {existingEntryForSelectedDate.status}
          </span>
          , Logged:{" "}
          <span className="font-mono font-bold text-rose-200">
            {formatMinutesToHHMM(existingEntryForSelectedDate.total_minutes_spent || 0)}
          </span>
          ). Multiple timesheets cannot be created for the same date.
        </Alert>
      )}

      {isFutureDate && (
        <Alert variant="error">
          You cannot log or submit timesheet entries for future dates. Please select today or a date
          within the last 7 days.
        </Alert>
      )}

      {isOlderThan7Days && (
        <Alert variant="error">
          Timesheets are locked for dates older than 7 days ({minAllowedDate}). Please contact your
          administrator if you need an exception.
        </Alert>
      )}

      {projects.length === 0 && !isProjectsLoading && (
        <Alert variant="info">
          No active projects found. Please create or assign projects before logging timesheets.
        </Alert>
      )}

      {/* Project Allocation Blocks List */}
      <div className="space-y-4">
        {projectBlocks.map((block, pIndex) => {
          const availableProjects = projects.filter(
            (project) =>
              project.id === block.projectId ||
              !projectBlocks.some(
                (otherBlock) => otherBlock.id !== block.id && otherBlock.projectId === project.id
              )
          );

          const projectOptions = availableProjects.map((project) => ({
            value: project.id,
            label: `${project.name} (${project.code})`,
          }));

          return (
            <ProjectAllocationBlock
              key={block.id}
              block={block}
              blockIndex={pIndex}
              canRemoveBlock={projectBlocks.length > 1}
              projectOptions={projectOptions}
              onUpdateField={(field, value) => handleUpdateBlockField(block.id, field, value)}
              onRemoveBlock={() => handleRemoveProjectBlock(block.id)}
              onUpdateTasks={(tasks) => handleUpdateBlockTasks(block.id, tasks)}
            />
          );
        })}

        {projectBlocks.length < projects.length && (
          <button
            type="button"
            onClick={handleAddProjectBlock}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-950/30 hover:bg-slate-900/40"
          >
            <Layers className="w-4 h-4" />
            <span>Add Another Project Allocation</span>
          </button>
        )}
      </div>

      {isOver24Hours && (
        <Alert variant="error">
          Total logged time cannot exceed 24:00 hours per day (Currently:{" "}
          {formatHoursMinutes(totalMinutesAll)}).
        </Alert>
      )}

      {/* Footer Controls */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Work Duration</div>
            <div className="text-base font-extrabold font-mono text-emerald-400">
              {formatHoursMinutes(totalMinutesAll)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            isLoading={isLoading}
            disabled={
              totalMinutesAll <= 0 ||
              isOver24Hours ||
              isFutureDate ||
              isOlderThan7Days ||
              Boolean(existingEntryForSelectedDate) ||
              (projects.length === 0 && !isProjectsLoading)
            }
            className="flex items-center gap-2"
          >
            {isRejectedMode ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Resubmit Timesheet</span>
              </>
            ) : isEditMode ? (
              <>
                <Briefcase className="w-4 h-4" />
                <span>Update Timesheet</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                <span>Submit Timesheet</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function LogTimesheetModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  defaultWorkDate,
  existingEntries = [],
  editingEntry = null,
}: LogTimesheetModalProps) {
  if (!isOpen) return null;

  const isRejectedMode = editingEntry?.status === "rejected";
  const isEditMode = Boolean(editingEntry);

  const modalTitle = isRejectedMode
    ? "Resubmit Rejected Timesheet"
    : isEditMode
      ? "Edit Timesheet Entry"
      : "Log Timesheet";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="3xl">
      <LogTimesheetForm
        key={`${editingEntry?.id || "new"}-${defaultWorkDate || "default"}`}
        onClose={onClose}
        onSubmit={onSubmit}
        onUpdate={onUpdate}
        isLoading={isLoading}
        defaultWorkDate={defaultWorkDate}
        existingEntries={existingEntries}
        editingEntry={editingEntry}
      />
    </Modal>
  );
}
