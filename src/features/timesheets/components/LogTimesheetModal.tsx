"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Alert } from "@/components/ui/Alert";
import { projectsApi } from "@/features/projects/api/projects-api";
import { Project } from "@/features/projects/types/project-types";
import { TimesheetEntryCreatePayload } from "../types/timesheet-types";
import { getTodayDateString } from "@/lib/date-utils";
import { useAuthStore } from "@/store/use-auth-store";
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
  onSubmit: (payloads: TimesheetEntryCreatePayload[]) => Promise<void>;
  isLoading: boolean;
}

function createEmptyTask(): TaskItem {
  return {
    id: "task-" + Math.random().toString(36).substring(2, 9),
    summary: "",
    hours: 1,
    minutes: 0,
  };
}

function createInitialProjectBlock(defaultProjectId = ""): ProjectBlock {
  return {
    id: "proj-" + Math.random().toString(36).substring(2, 9),
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
}: LogTimesheetModalProps) {
  const { user } = useAuthStore();
  const [workDate, setWorkDate] = useState(getTodayDateString);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);
  const [projectBlocks, setProjectBlocks] = useState<ProjectBlock[]>([createInitialProjectBlock()]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      projectsApi
        .listProjects()
        .then((res) => {
          if (isMounted && res.data) {
            const userDeptId = user?.department?.id;
            const sortedProjects = [...res.data].sort((a, b) => {
              const aInDept = a.departments?.some((d) => d.id === userDeptId) ? -1 : 1;
              const bInDept = b.departments?.some((d) => d.id === userDeptId) ? -1 : 1;
              return aInDept - bInDept;
            });

            setProjects(sortedProjects);
            if (sortedProjects.length > 0) {
              setProjectBlocks((prev) => {
                if (prev.length === 1 && !prev[0].projectId) {
                  return [{ ...prev[0], projectId: sortedProjects[0].id }];
                }
                return prev;
              });
            }
          }
        })
        .finally(() => {
          if (isMounted) {
            setHasLoadedProjects(true);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.department?.id]);

  const handleAddProjectBlock = () => {
    const defaultProjId = projects[0]?.id || "";
    setProjectBlocks((prev) => [...prev, createInitialProjectBlock(defaultProjId)]);
  };

  const handleRemoveProjectBlock = (blockId: string) => {
    if (projectBlocks.length === 1) return;
    setProjectBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleUpdateProjectField = (
    blockId: string,
    field: "projectId" | "isBillable",
    value: unknown
  ) => {
    setProjectBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)));
  };

  const handleAddTask = (blockId: string) => {
    setProjectBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, tasks: [...b.tasks, createEmptyTask()] } : b))
    );
  };

  const handleRemoveTask = (blockId: string, taskId: string) => {
    setProjectBlocks((prev) =>
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
    setProjectBlocks((prev) =>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOver24Hours || totalMinutesAll <= 0) return;

    const payloads: TimesheetEntryCreatePayload[] = [];
    for (const block of projectBlocks) {
      for (const task of block.tasks) {
        const taskMinutes = (Number(task.hours) || 0) * 60 + (Number(task.minutes) || 0);
        if (taskMinutes <= 0 || !task.summary.trim()) continue;

        payloads.push({
          project_id: block.projectId || undefined,
          work_date: workDate,
          hours_spent: Number((taskMinutes / 60).toFixed(2)),
          activity_summary: task.summary.trim(),
          is_billable: block.isBillable,
        });
      }
    }

    if (payloads.length === 0) return;

    await onSubmit(payloads);
    setProjectBlocks([createInitialProjectBlock(projects[0]?.id || "")]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Daily Work & Timesheets"
      description="Record granular task activities, project allocations, and work hours across your assigned initiatives."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">Timesheet Log Date</h4>
              <p className="text-[11px] text-slate-400">
                All task logs will be recorded for this day
              </p>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <DatePicker label="" value={workDate} onChange={(val) => setWorkDate(val)} required />
          </div>
        </div>

        {projects.length === 0 && hasLoadedProjects && (
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
                    {projectBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectBlock(block.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
                    value={block.projectId}
                    onChange={(e) =>
                      handleUpdateProjectField(block.id, "projectId", e.target.value)
                    }
                    options={projects.map((p) => ({
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
                    const taskFormatted = formatHoursMinutes(
                      (Number(task.hours) || 0) * 60 + (Number(task.minutes) || 0)
                    );

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 group"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={task.summary}
                            onChange={(e) =>
                              handleUpdateTask(block.id, task.id, "summary", e.target.value)
                            }
                            placeholder={`Task ${tIndex + 1}: e.g. Feature implementation, code review...`}
                            required
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-100 rounded-lg px-3 py-2 outline-none transition-all"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
                            <input
                              type="number"
                              min={0}
                              max={23}
                              value={task.hours}
                              onChange={(e) =>
                                handleUpdateTask(
                                  block.id,
                                  task.id,
                                  "hours",
                                  Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                                )
                              }
                              className="w-8 bg-transparent text-center text-xs font-mono font-bold text-white outline-none"
                              placeholder="HH"
                            />
                            <span className="text-slate-500 font-mono text-xs font-bold">:</span>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              step={5}
                              value={task.minutes}
                              onChange={(e) =>
                                handleUpdateTask(
                                  block.id,
                                  task.id,
                                  "minutes",
                                  Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                                )
                              }
                              className="w-8 bg-transparent text-center text-xs font-mono font-bold text-white outline-none"
                              placeholder="mm"
                            />
                          </div>

                          <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono font-semibold text-indigo-300 min-w-[52px] text-center">
                            {taskFormatted}
                          </div>

                          {block.tasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(block.id, task.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
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

                    <div className="text-xs text-slate-400">
                      Project Subtotal:{" "}
                      <span className="font-mono font-bold text-white">
                        {formatHoursMinutes(projectMinutes)} ({(projectMinutes / 60).toFixed(1)}h)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddProjectBlock}
            className="flex items-center gap-1.5 text-xs py-2"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Add Another Project Allocation</span>
          </Button>
        </div>

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
                {formatHoursMinutes(totalMinutesAll)}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({totalHoursDecimal.toFixed(2)} hrs total)
                </span>
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
                (projects.length === 0 && hasLoadedProjects)
              }
              className="flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Save Timesheet Entries</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
