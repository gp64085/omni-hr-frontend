"use client";

import React, { useState } from "react";
import { LeaveRequest, LeaveStatusUpdatePayload } from "../types/leave-types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, ShieldCheck, CheckSquare, Square } from "lucide-react";

interface TeamApprovalsQueueProps {
  requests: LeaveRequest[];
  isLoading: boolean;
  onUpdateStatus: (id: string, payload: LeaveStatusUpdatePayload) => Promise<void>;
}

export function TeamApprovalsQueue({
  requests,
  isLoading,
  onUpdateStatus,
}: TeamApprovalsQueueProps) {
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
  const [comments, setComments] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAction = (req: LeaveRequest, type: "approved" | "rejected") => {
    setSelectedReq(req);
    setActionType(type);
    setComments("");
    // Default to selecting all days
    const allDays = req.extra_metadata?.days?.map((d) => d.date) || [];
    setSelectedDates(allDays);
  };

  const toggleDate = (dStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dStr) ? prev.filter((d) => d !== dStr) : [...prev, dStr]
    );
  };

  const selectAllDates = () => {
    const allDays = selectedReq?.extra_metadata?.days?.map((d) => d.date) || [];
    setSelectedDates(allDays);
  };

  const deselectAllDates = () => {
    setSelectedDates([]);
  };

  const handleConfirm = async () => {
    if (!selectedReq) return;
    setIsSubmitting(true);
    try {
      const allDays = selectedReq.extra_metadata?.days?.map((d) => d.date) || [];
      const hasMultiDays = allDays.length > 1;

      let payload: LeaveStatusUpdatePayload;

      if (actionType === "approved" && hasMultiDays && selectedDates.length < allDays.length) {
        // Partial approval
        const rejected = allDays.filter((d) => !selectedDates.includes(d));
        payload = {
          status: "approved",
          comments: comments || undefined,
          approved_dates: selectedDates,
          rejected_dates: rejected,
          rejection_reason: comments || "Selected days declined by manager",
        };
      } else {
        payload = {
          status: actionType,
          comments: comments || undefined,
          rejection_reason: actionType === "rejected" ? comments || undefined : undefined,
        };
      }

      await onUpdateStatus(selectedReq.id, payload);
      setSelectedReq(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: "Applicant",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
            {r.user?.first_name?.[0] || "U"}
          </div>
          <div>
            <div className="font-semibold text-white">
              {r.user?.first_name} {r.user?.last_name}
            </div>
            <div className="text-[11px] text-slate-400">{r.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Leave Type",
      cell: (r) => (
        <span className="font-semibold text-white capitalize">{r.leave_type?.name || "Leave"}</span>
      ),
    },
    {
      header: "Dates & Day Breakdown",
      cell: (r) => {
        const days = r.extra_metadata?.days;
        return (
          <div className="space-y-1">
            <div className="text-slate-300">
              {r.start_date} {r.start_date !== r.end_date ? `to ${r.end_date}` : ""}
            </div>
            {days && days.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {days.map((d) => (
                  <span
                    key={d.date}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {d.date.split("-").slice(1).join("/")}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Days",
      cell: (r) => (
        <span className="font-bold text-indigo-400">
          {r.total_days} {r.total_days === 1 ? "day" : "days"}
        </span>
      ),
    },
    {
      header: "Reason",
      cell: (r) => (
        <span className="text-slate-400 max-w-xs truncate block">{r.reason || "—"}</span>
      ),
    },
    {
      header: "Review Action",
      align: "right",
      cell: (r) => {
        const isActionable = r.status === "pending";
        if (!isActionable) return null;

        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleOpenAction(r, "approved")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleOpenAction(r, "rejected")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        );
      },
    },
  ];

  const daysList = selectedReq?.extra_metadata?.days || [];
  const hasMultiDays = daysList.length > 1;

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        loadingMessage="Loading pending approval queue..."
        emptyState={{
          icon: ShieldCheck,
          title: "All Caught Up!",
          description: "There are no pending leave requests awaiting your review.",
        }}
      />

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title={actionType === "approved" ? "Approve Leave Request" : "Reject Leave Request"}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs text-slate-300">
            <div>
              <strong className="text-white">Applicant:</strong> {selectedReq?.user?.first_name}{" "}
              {selectedReq?.user?.last_name}
            </div>
            <div>
              <strong className="text-white">Leave Type:</strong> {selectedReq?.leave_type?.name} (
              {selectedReq?.total_days} days)
            </div>
            <div>
              <strong className="text-white">Dates:</strong> {selectedReq?.start_date} to{" "}
              {selectedReq?.end_date}
            </div>
            {selectedReq?.reason && (
              <div>
                <strong className="text-white">Reason:</strong> {selectedReq.reason}
              </div>
            )}
          </div>

          {/* Day-Wise Partial Approval Selection */}
          {actionType === "approved" && hasMultiDays && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Select Days to Approve (Partial Approval):
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllDates}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={deselectAllDates}
                    className="text-slate-400 hover:text-slate-300 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {daysList.map((d) => {
                  const isChecked = selectedDates.includes(d.date);
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => toggleDate(d.date)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                          : "bg-slate-900 border-slate-800 text-slate-400 opacity-60 line-through"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold">{d.date}</div>
                        <div className="text-[10px] text-slate-400">
                          {d.total_days} {d.total_days === 1 ? "day" : "half-day"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDates.length < daysList.length && selectedDates.length > 0 && (
                <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  {daysList.length - selectedDates.length} day(s) will be declined and marked as
                  working days for the employee.
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Approver Remarks / Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="e.g. Approved. Please ensure handoff to team..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedReq(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={actionType === "approved" ? "gradient" : "danger"}
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={actionType === "approved" && hasMultiDays && selectedDates.length === 0}
            >
              {actionType === "approved"
                ? selectedDates.length < daysList.length && hasMultiDays
                  ? `Approve ${selectedDates.length} of ${daysList.length} Days`
                  : "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
