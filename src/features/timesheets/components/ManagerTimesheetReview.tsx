"use client";

import React, { useState } from "react";
import { TimesheetEntry, TimesheetProjectAllocation } from "../types/timesheet-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { CheckCircle2, XCircle, ShieldCheck, Eye, Briefcase } from "lucide-react";
import { formatDecimalHoursToHHMM } from "@/lib/date-utils";
import { TimesheetDetailsModal } from "./TimesheetDetailsModal";

interface ManagerTimesheetReviewProps {
  entries: TimesheetEntry[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: "approved" | "rejected", reason?: string) => Promise<void>;
}

export function ManagerTimesheetReview({
  entries,
  isLoading,
  onUpdateStatus,
}: ManagerTimesheetReviewProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  };

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
        return <span className="text-slate-300 text-xs">{rawActivity}</span>;
      }
    }

    if (parsed.length === 0) {
      return <span className="text-slate-400 text-xs italic">No tasks breakdown</span>;
    }

    const allocations = parsed.filter(
      (item): item is TimesheetProjectAllocation =>
        typeof item === "object" && item !== null && "tasks" in item
    );

    if (allocations.length > 0) {
      return (
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          {allocations.map((alloc, idx) => {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-200 transition-all cursor-pointer text-xs group"
                title="Click to view task details"
              >
                <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-200 group-hover:text-indigo-300">
                  {alloc.project_name || "Project"}
                </span>
                {alloc.total_hours !== undefined && (
                  <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    {formatDecimalHoursToHHMM(Number(alloc.total_hours))}
                  </span>
                )}
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
      header: "Work Date",
      accessorKey: "work_date",
      className: "font-semibold text-white whitespace-nowrap",
    },
    {
      header: "Hours Logged",
      cell: (e) => (
        <span className="font-bold font-mono text-indigo-400 whitespace-nowrap">
          {formatDecimalHoursToHHMM(e.hours_spent || 0)}
        </span>
      ),
    },
    {
      header: "Project Overview",
      cell: (e) => renderProjectOverview(e),
    },
    {
      header: "Status",
      cell: (e) => <StatusBadge status={e.status} />,
    },
    {
      header: "Review Decision",
      align: "right",
      cell: (e) => {
        const isProcessing = processingId === e.id;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedEntry(e)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="View Timesheet Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleAction(e.id, "approved")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleAction(e.id, "rejected")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={entries}
        keyExtractor={(e) => e.id}
        isLoading={isLoading}
        loadingMessage="Loading submitted timesheet entries..."
        emptyState={{
          icon: ShieldCheck,
          title: "No pending timesheets",
          description: "All submitted team timesheets have been reviewed.",
        }}
      />

      <TimesheetDetailsModal
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </>
  );
}
