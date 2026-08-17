"use client";

import React, { useState } from "react";
import { LeaveRequest } from "../types/leave-types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface TeamApprovalsQueueProps {
  requests: LeaveRequest[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: "approved" | "rejected", comments?: string) => Promise<void>;
}

export function TeamApprovalsQueue({
  requests,
  isLoading,
  onUpdateStatus,
}: TeamApprovalsQueueProps) {
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAction = (req: LeaveRequest, type: "approved" | "rejected") => {
    setSelectedReq(req);
    setActionType(type);
    setComments("");
  };

  const handleConfirm = async () => {
    if (!selectedReq) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(selectedReq.id, actionType, comments || undefined);
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
      header: "Dates",
      cell: (r) => (
        <span className="text-slate-300">
          {r.start_date} {r.start_date !== r.end_date ? `to ${r.end_date}` : ""}
        </span>
      ),
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
      cell: (r) => (
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
      ),
    },
  ];

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
        description={`Confirm decision for ${selectedReq?.user?.first_name} ${selectedReq?.user?.last_name}'s leave`}
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
            >
              {actionType === "approved" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
