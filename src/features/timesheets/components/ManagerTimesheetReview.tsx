"use client";

import React, { useState } from "react";
import { TimesheetEntry } from "../types/timesheet-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

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

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  const columns: Column<TimesheetEntry>[] = [
    {
      header: "Work Date",
      accessorKey: "work_date",
      className: "font-semibold text-white",
    },
    {
      header: "Project",
      cell: (e) => (
        <span className="font-semibold text-slate-200">
          {e.project_name || e.project?.name || "General Work"}
        </span>
      ),
    },
    {
      header: "Hours Logged",
      cell: (e) => (
        <span className="font-bold text-indigo-400">{(e.hours_spent || 0).toFixed(1)} hrs</span>
      ),
    },
    {
      header: "Activity Summary",
      cell: (e) => (
        <span className="text-slate-400 max-w-xs truncate block">{e.activity_summary}</span>
      ),
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
              onClick={() => handleAction(e.id, "approved")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleAction(e.id, "rejected")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
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
  );
}
