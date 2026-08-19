"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { Alert } from "@/components/ui/Alert";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-queries";
import { TimesheetEntryCreatePayload } from "../types/timesheet-types";
import { getTodayDateString } from "@/lib/date-utils";
import { subDays, format } from "date-fns";
import { Plus, Trash2, Clock, Briefcase, CheckCircle2, Layers } from "lucide-react";

interface TaskItem {
  id: string;
  summary: string;
  hours: number;
  minutes: number;
}

interface ProjectBlock {
  id: string;
  projectId: string;
  isBillable: boolean;
  tasks: TaskItem[];
}

interface LogTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TimesheetEntryCreatePayload) => Promise<void>;
  isLoading: boolean;
  defaultWorkDate?: string;
}

function createEmptyTask(): TaskItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(),
    summary: "",
    hours: 1,
    minutes: 0,
  };
}

function createInitialProjectBlock(defaultProjectId = ""): ProjectBlock {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(),
    projectId: defaultProjectId,
    isBillable: true,
    tasks: [createEmptyTask()],
  };
}

function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function LogTimesheetModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultWorkDate,
}: LogTimesheetModalProps) {
  const [workDate, setWorkDate] = useState(defaultWorkDate || getTodayDateString);
  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsQuery();

  const [projectBlocks, setProjectBlocks] = useState<ProjectBlock[]>([createInitialProjectBlock()]);

  const handleAddProjectBlock = () => {
    const defaultProjId = projects[0]?.id || "";
    const selectedProjectIds = projectBlocks
      .map((b) => b.projectId || defaultProjId)
      .filter(Boolean);
    const nextAvailableProject = projects.find((p) => !selectedProjectIds.includes(p.id));
    const nextProjId = nextAvailableProject ? nextAvailableProject.id : defaultProjId;
    setProjectBlocks((prev: ProjectBlock[]) => [...prev, createInitialProjectBlock(nextProjId)]);
  };

  const handleRemoveProjectBlock = (blockId: string) => {
    if (projectBlocks.length === 1) return;
    setProjectBlocks((prev: ProjectBlock[]) => prev.filter((b) => b.id !== blockId));
  };

  const handleUpdateProjectField = (
    blockId: string,
    field: "projectId" | "isBillable",
    value: string | boolean
  ) => {
    setProjectBlocks((prev: ProjectBlock[]) =>
      prev.map((b) => (b.id === blockId ? { ...b, [field]: value } : b))
    );
  };

  const handleAddTask = (blockId: string) => {
    setProjectBlocks((prev: ProjectBlock[]) =>
      prev.map((b) => (b.id === blockId ? { ...b, tasks: [...b.tasks, createEmptyTask()] } : b))
    );
  };

  const handleRemoveTask = (blockId: string, taskId: string) => {
    setProjectBlocks((prev: ProjectBlock[]) =>
      prev.map((b) => {
        if (b.id === blockId) {
          if (b.tasks.length === 1) return b;
          return { ...b, tasks: b.tasks.filter((t) => t.id !== taskId) };
        }
        return b;
      })
    );
  };

  const handleUpdateTask = (
    blockId: string,
    taskId: string,
    field: "summary" | "hours" | "minutes",
    value: string | number
  ) => {
    setProjectBlocks((prev: ProjectBlock[]) =>
      prev.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            tasks: b.tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)),
          };
        }
        return b;
      })
    );
  };

  const totalMinutesAll = projectBlocks.reduce((acc, block) => {
    const blockMinutes = block.tasks.reduce(
      (taskAcc, t) => taskAcc + (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0),
      0
    );
    return acc + blockMinutes;
  }, 0);

  const totalHoursDecimal = totalMinutesAll / 60;
  const isOver24Hours = totalHoursDecimal > 24;
  const todayStr = getTodayDateString();
  const minAllowedDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const isFutureDate = workDate > todayStr;
  const isOlderThan7Days = workDate < minAllowedDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOver24Hours || totalMinutesAll <= 0 || isFutureDate || isOlderThan7Days) return;

    const allocations = projectBlocks
      .map((block) => {
        const effectiveProjectId = block.projectId || projects[0]?.id || "";
        const validTasks = block.tasks
          .filter((t) => t.summary.trim())
          .map((t) => {
            const mins = (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0);
            return {
              summary: t.summary.trim(),
              hours: Number((mins / 60).toFixed(2)),
              minutes: mins % 60,
              formatted_time: formatHoursMinutes(mins),
            };
          });

        const projTotalMins = block.tasks.reduce(
          (acc, t) => acc + (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0),
          0
        );
        const projectObj = projects.find((p) => p.id === effectiveProjectId);

        return {
          project_id: effectiveProjectId || undefined,
          project_name: projectObj ? `${projectObj.name} (${projectObj.code})` : undefined,
          is_billable: block.isBillable,
          tasks: validTasks,
          total_hours: Number((projTotalMins / 60).toFixed(2)),
        };
      })
      .filter((b) => b.tasks.length > 0);

    if (allocations.length === 0) return;

    const singlePayload: TimesheetEntryCreatePayload = {
      project_id: allocations[0]?.project_id,
      work_date: workDate,
      hours_spent: Number((totalMinutesAll / 60).toFixed(2)),
      activity_summary: allocations,
      is_billable: true,
    };

    await onSubmit(singlePayload);
    setProjectBlocks([createInitialProjectBlock(projects[0]?.id || "")]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Timesheet" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {isFutureDate && (
          <Alert variant="error">
            You cannot log or submit timesheet entries for future dates. Please select today or a
            date within the last 7 days.
          </Alert>
        )}

        {isOlderThan7Days && (
          <Alert variant="error">
            Timesheets are locked for dates older than 7 days ({minAllowedDate}). Please contact
            your administrator if you need an exception.
          </Alert>
        )}

        {projects.length === 0 && !isProjectsLoading && (
          <Alert variant="info">
            No active projects found. Please create or assign projects before logging timesheets.
          </Alert>
        )}

        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
          {projectBlocks.map((block, pIndex) => {
            const projectMinutes = block.tasks.reduce(
              (acc, t) => acc + (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0),
              0
            );

            const availableProjects = projects.filter(
              (p) =>
                p.id === block.projectId ||
                !projectBlocks.some((b) => b.id !== block.id && b.projectId === p.id)
            );

            return (
              <div
                key={block.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                      P{pIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Project Allocation
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-semibold text-indigo-300 flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-sans font-medium">
                        Total:
                      </span>
                      <span>{formatHoursMinutes(projectMinutes)}</span>
                    </div>

                    {projectBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectBlock(block.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Project Allocation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <Select
                    label="Select Project"
                    value={block.projectId || projects[0]?.id || ""}
                    onChange={(e) =>
                      handleUpdateProjectField(block.id, "projectId", e.target.value)
                    }
                    options={availableProjects.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.code})`,
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                    <span>Task Description</span>
                    <span>Duration (HH:mm)</span>
                  </div>

                  {block.tasks.map((task, tIndex) => {
                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 group"
                      >
                        <div className="flex-1">
                          <textarea
                            rows={2}
                            value={task.summary}
                            onChange={(e) =>
                              handleUpdateTask(block.id, task.id, "summary", e.target.value)
                            }
                            placeholder={`Task ${tIndex + 1}: e.g. Feature implementation, code review, meeting notes...`}
                            required
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-100 rounded-lg px-3 py-2 outline-none transition-all resize-y min-h-[42px] leading-relaxed break-words placeholder:text-slate-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          <TimePicker
                            value={Number((task.hours + task.minutes / 60).toFixed(2))}
                            onChange={(val) => {
                              const floatHours = parseFloat(val) || 0;
                              const totalMinutes = Math.round(floatHours * 60);
                              handleUpdateTask(
                                block.id,
                                task.id,
                                "hours",
                                Math.floor(totalMinutes / 60)
                              );
                              handleUpdateTask(block.id, task.id, "minutes", totalMinutes % 60);
                            }}
                            className="w-32"
                          />

                          {block.tasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(block.id, task.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer mt-0.5"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddTask(block.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer py-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Task</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {projects.length > projectBlocks.length && (
          <div className="flex justify-start">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddProjectBlock}
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Add Another Project Allocation</span>
            </Button>
          </div>
        )}

        {isOver24Hours && (
          <Alert variant="error">
            Total logged time cannot exceed 24:00 hours per day (Currently:{" "}
            {formatHoursMinutes(totalMinutesAll)}).
          </Alert>
        )}

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Work Duration Logged</div>
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
                (projects.length === 0 && !isProjectsLoading)
              }
              className="flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Submit Timesheet</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
