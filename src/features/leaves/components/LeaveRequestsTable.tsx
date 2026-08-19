"use client";

import React from "react";
import { LeaveRequest } from "../types/leave-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Calendar, Ban } from "lucide-react";
import { hasDatePassed } from "@/lib/date-utils";

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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white capitalize">{r.leave_type?.name || "Leave"}</span>
          {r.extra_metadata?.partial_decision ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Partial Decision
            </span>
          ) : null}
          {r.extra_metadata?.lwp_days ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              +{r.extra_metadata.lwp_days}d LWP
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Duration & Dates",
      cell: (r) => {
        const days = r.extra_metadata?.days;
        return (
          <div className="space-y-1">
            <div className="font-medium text-white">
              {r.start_date} {r.start_date !== r.end_date ? `to ${r.end_date}` : ""}
            </div>
            {r.is_half_day && (
              <div className="text-[10px] text-indigo-400 capitalize">
                Half-Day ({r.half_day_session?.replace("_", " ") || "Single Session"})
              </div>
            )}
            {days && days.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {days.map((d) => {
                  const isApp = d.day_status === "approved";
                  const isRej = d.day_status === "rejected";
                  const dayNum = d.date.split("-").slice(1).join("/");
                  return (
                    <span
                      key={d.date}
                      title={`${d.date}: ${d.day_status.toUpperCase()}${d.rejection_reason ? ` (${d.rejection_reason})` : ""}`}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        isApp
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                          : isRej
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-300 line-through"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      {dayNum}
                      {isApp && <span className="ml-1 text-[8px]">✓</span>}
                      {isRej && <span className="ml-1 text-[8px]">✗</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
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
        const isPassed = hasDatePassed(r.start_date);
        const isCancellable = (r.status === "pending" || r.status === "approved") && !isPassed;
        return isCancellable && onCancel ? (
          <button
            onClick={() => onCancel(r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
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
