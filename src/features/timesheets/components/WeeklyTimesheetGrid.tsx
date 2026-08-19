"use client";

import React, { useState } from "react";
import { TimesheetEntry, TimesheetProjectAllocation } from "../types/timesheet-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Clock, Trash2, Eye, Briefcase, Pencil, RotateCcw } from "lucide-react";
import { formatMinutesToHHMM } from "@/lib/date-utils";
import { TimesheetDetailsModal } from "./TimesheetDetailsModal";

interface WeeklyTimesheetGridProps {
  entries: TimesheetEntry[];
  isLoading: boolean;
  onEdit?: (entry: TimesheetEntry) => void;
  onDelete?: (id: string) => void;
}

export function WeeklyTimesheetGrid({
  entries,
  isLoading,
  onEdit,
  onDelete,
}: WeeklyTimesheetGridProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);

  const renderProjectOverview = (entry: TimesheetEntry) => {
    const rawActivity = entry.activity_summary;
    if (!rawActivity) {
      return <span className="text-slate-400 text-xs italic">No activity recorded</span>;
    }

    let parsed: unknown[] = [];
    if (Array.isArray(rawActivity)) {
      parsed = rawActivity;
    } else if (typeof rawActivity === "string") {
      try {
        const res = JSON.parse(rawActivity);
        parsed = Array.isArray(res) ? res : [rawActivity];
      } catch {
        return <span className="text-slate-300 text-xs truncate max-w-xs">{rawActivity}</span>;
      }
    }

    if (parsed.length === 0) {
      return <span className="text-slate-400 text-xs italic">No tasks logged</span>;
    }

    const allocations = parsed.filter(
      (item): item is TimesheetProjectAllocation =>
        typeof item === "object" && item !== null && "tasks" in item
    );

    if (allocations.length > 0) {
      return (
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          {allocations.map((alloc, index) => {
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-200 transition-all cursor-pointer text-xs group"
                title="Click to view task details"
              >
                <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-200 group-hover:text-indigo-300">
                  {alloc.project_name || "Project"}
                </span>
                <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {formatMinutesToHHMM(alloc.total_minutes_spent || 0)}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setSelectedEntry(entry)}
        className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
      >
        View Details
      </button>
    );
  };

  const columns: Column<TimesheetEntry>[] = [
    {
      header: "Date",
      accessorKey: "work_date",
      className: "font-semibold text-white whitespace-nowrap",
    },
    {
      header: "Total Time",
      cell: (entry) => {
        const totalMins = Number(entry.total_minutes_spent) || 0;
        return (
          <span className="font-bold font-mono text-indigo-400 whitespace-nowrap">
            {formatMinutesToHHMM(totalMins)}
          </span>
        );
      },
    },
    {
      header: "Project Overview",
      cell: (entry) => renderProjectOverview(entry),
    },
    {
      header: "Status",
      cell: (entry) => <StatusBadge status={entry.status} />,
    },
    {
      header: "Action",
      align: "right",
      cell: (entry) => {
        const isEditable =
          entry.status === "draft" || entry.status === "submitted" || entry.status === "rejected";
        const isRejected = entry.status === "rejected";

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedEntry(entry)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="View Timesheet Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {isEditable && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isRejected
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border-indigo-500/30"
                }`}
                title={isRejected ? "Edit & Resubmit Rejected Timesheet" : "Edit Entry"}
              >
                {isRejected ? (
                  <RotateCcw className="w-3.5 h-3.5" />
                ) : (
                  <Pencil className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {isEditable && (
              <button
                type="button"
                onClick={() => onDelete?.(entry.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                title="Delete Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={entries}
        keyExtractor={(entry) => entry.id}
        isLoading={isLoading}
        loadingMessage="Loading daily work logs..."
        emptyState={{
          icon: Clock,
          title: "No timesheet entries logged this week",
          description: 'Click "Log Daily Work" to add your hours and project tasks.',
        }}
      />

      <TimesheetDetailsModal
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  );
}
