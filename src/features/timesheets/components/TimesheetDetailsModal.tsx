"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  TimesheetEntry,
  TimesheetProjectAllocation,
  TimesheetTaskDetail,
} from "../types/timesheet-types";
import { formatDecimalHoursToHHMM } from "@/lib/date-utils";
import { Calendar, Briefcase, AlertCircle } from "lucide-react";

interface TimesheetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimesheetEntry | null;
}

export function TimesheetDetailsModal({ isOpen, onClose, entry }: TimesheetDetailsModalProps) {
  if (!entry) return null;

  let parsed: unknown[] = [];
  const rawActivity = entry.activity_summary;
  if (Array.isArray(rawActivity)) {
    parsed = rawActivity;
  } else if (typeof rawActivity === "string") {
    try {
      const res = JSON.parse(rawActivity);
      parsed = Array.isArray(res) ? res : [rawActivity];
    } catch {
      parsed = [rawActivity];
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timesheet Details" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Work Date
              </span>
              <span className="text-base font-bold text-white">{entry.work_date}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Hours
              </span>
              <span className="text-base font-mono font-bold text-indigo-400">
                {formatDecimalHoursToHHMM(entry.hours_spent || 0)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </span>
              <StatusBadge status={entry.status} />
            </div>
          </div>
        </div>

        {/* Rejection Reason if any */}
        {entry.rejection_reason && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-rose-200">Rejection Reason:</span>
              <p className="mt-0.5 leading-relaxed">{entry.rejection_reason}</p>
            </div>
          </div>
        )}

        {/* Project Allocations & Tasks Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Project Allocations & Tasks Breakdown</span>
          </div>

          {parsed.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
              No task details recorded for this timesheet entry.
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {parsed.map((item, idx) => {
                if (typeof item === "object" && item !== null && "tasks" in item) {
                  const alloc = item as TimesheetProjectAllocation;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {alloc.project_name || "Project Allocation"}
                          </span>
                        </div>

                        {alloc.total_hours !== undefined && (
                          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300">
                            {formatDecimalHoursToHHMM(Number(alloc.total_hours))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {alloc.tasks && alloc.tasks.length > 0 ? (
                          alloc.tasks.map((t: TimesheetTaskDetail, tIdx: number) => (
                            <div
                              key={tIdx}
                              className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/50"
                            >
                              <p className="text-xs text-slate-200 leading-relaxed flex-1 break-words">
                                • {t.summary}
                              </p>
                              <span className="font-mono text-xs font-semibold text-slate-300 shrink-0 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                                {t.formatted_time || formatDecimalHoursToHHMM(Number(t.hours))}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No tasks listed</p>
                        )}
                      </div>
                    </div>
                  );
                }

                const fallbackItem = item as Record<string, unknown>;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <p className="text-xs text-slate-200 leading-relaxed break-words">
                      •{" "}
                      {String(
                        fallbackItem.summary ||
                          fallbackItem.task_description ||
                          JSON.stringify(fallbackItem)
                      )}
                    </p>
                    {fallbackItem.hours !== undefined && (
                      <span className="font-mono text-xs text-slate-400 shrink-0">
                        {formatDecimalHoursToHHMM(Number(fallbackItem.hours))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800/80">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
