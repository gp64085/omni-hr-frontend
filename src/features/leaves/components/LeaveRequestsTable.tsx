"use client";

import React from "react";
import { LeaveRequest } from "../types/leave-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Calendar, Ban } from "lucide-react";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  isLoading: boolean;
  onCancel?: (req: LeaveRequest) => void;
}

export function LeaveRequestsTable({ requests, isLoading, onCancel }: LeaveRequestsTableProps) {
  const columns: Column<LeaveRequest>[] = [
    {
      header: "Leave Type",
      cell: (r) => (
        <span className="font-bold text-white capitalize">{r.leave_type?.name || "Leave"}</span>
      ),
    },
    {
      header: "Duration & Dates",
      cell: (r) => (
        <div>
          <div className="font-medium text-white">
            {r.start_date} {r.start_date !== r.end_date ? `to ${r.end_date}` : ""}
          </div>
          {r.is_half_day && (
            <div className="text-[10px] text-indigo-400 mt-0.5 capitalize">
              Half-Day ({r.half_day_session?.replace("_", " ") || "Single Session"})
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Total Days",
      cell: (r) => (
        <span className="font-semibold text-slate-200">
          {r.total_days} {r.total_days === 1 ? "day" : "days"}
        </span>
      ),
    },
    {
      header: "Reason / Notes",
      cell: (r) => (
        <div className="max-w-xs truncate text-slate-400">
          {r.reason || "—"}
          {r.approver_comments && (
            <div className="text-[10px] text-slate-500 mt-0.5">Approver: {r.approver_comments}</div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: "Action",
      align: "right",
      cell: (r) => {
        const isCancellable = r.status === "pending" || r.status === "approved";
        return isCancellable && onCancel ? (
          <button
            onClick={() => onCancel(r)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        ) : null;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      loadingMessage="Loading leave requests..."
      emptyState={{
        icon: Calendar,
        title: "No leave requests found",
        description: "Apply for leave above to submit a new request.",
      }}
    />
  );
}
