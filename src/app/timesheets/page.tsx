"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WeeklySummaryBar } from "@/features/timesheets/components/WeeklySummaryBar";
import { WeeklyTimesheetGrid } from "@/features/timesheets/components/WeeklyTimesheetGrid";
import { ManagerTimesheetReview } from "@/features/timesheets/components/ManagerTimesheetReview";
import { LogTimesheetModal } from "@/features/timesheets/components/LogTimesheetModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Clock, CheckSquare, Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { TimesheetEntryCreatePayload } from "@/features/timesheets/types/timesheet-types";
import { useAuthStore } from "@/store/use-auth-store";
import { getWeekDates, formatDisplayDate } from "@/lib/date-utils";
import { PERMISSIONS, PAGINATION } from "@/constants";
import {
  useTimesheetEntriesQuery,
  useWeeklySummaryQuery,
  useManagerTimesheetReviewQuery,
  useLogTimesheetMutation,
  useDeleteTimesheetMutation,
  useUpdateTimesheetStatusMutation,
} from "@/features/timesheets/hooks/use-timesheets-queries";

export default function TimesheetsPage() {
  const { user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState("my_timesheet");
  const [weekOffset, setWeekOffset] = useState(0);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const canApprove = hasPermission(PERMISSIONS.TIMESHEET_APPROVE);

  const { startDate, endDate } = getWeekDates(weekOffset);

  // Queries
  const { data: entries = [], isLoading: isEntriesLoading } = useTimesheetEntriesQuery({
    start_date: startDate,
    end_date: endDate,
    user_id: user?.id,
    limit: PAGINATION.MAX_LIMIT,
  });

  const { data: summary = null, isLoading: isSummaryLoading } = useWeeklySummaryQuery(
    startDate,
    endDate
  );

  const { data: reviewEntries = [], isLoading: isReviewLoading } = useManagerTimesheetReviewQuery(
    {
      start_date: startDate,
      end_date: endDate,
      limit: PAGINATION.MAX_LIMIT,
    },
    { enabled: canApprove }
  );

  // Mutations
  const logMutation = useLogTimesheetMutation();
  const deleteMutation = useDeleteTimesheetMutation();
  const updateStatusMutation = useUpdateTimesheetStatusMutation();

  const isLoading = isEntriesLoading || isSummaryLoading;

  const handleCreateEntry = async (payload: TimesheetEntryCreatePayload) => {
    await logMutation.mutateAsync(payload);
    setLogModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    await deleteMutation.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  };

  const handleUpdateReviewStatus = async (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    await updateStatusMutation.mutateAsync({
      id,
      payload: { status, rejection_reason: reason },
    });
  };

  const tabs = [
    { id: "my_timesheet", label: "My Weekly Timesheet", icon: Clock, count: entries.length },
    ...(canApprove
      ? [
          {
            id: "manager_review",
            label: "Timesheet Approvals Queue",
            icon: CheckSquare,
            count: reviewEntries.length,
          },
        ]
      : []),
  ];

  return (
    <AppShell
      title="Timesheets & Work Logs"
      subtitle="Log daily work activities, track weekly hours, and approve team submissions"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Work</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Week Navigator */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Work Period</div>
              <div className="text-sm font-bold text-white">
                {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Week</span>
            </Button>

            {weekOffset !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeekOffset(0)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Jump to Current Week
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="flex items-center gap-1"
            >
              <span>Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekly Metric Summary */}
        <WeeklySummaryBar summary={summary} isLoading={isLoading} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "my_timesheet" && (
            <div className="text-xs text-slate-400 px-1">
              Logged entries for week: <strong className="text-white">{entries.length}</strong>
            </div>
          )}
        </div>

        {activeTab === "my_timesheet" ? (
          <WeeklyTimesheetGrid
            entries={entries}
            isLoading={isLoading}
            onDelete={(id) => setDeleteTargetId(id)}
          />
        ) : (
          <ManagerTimesheetReview
            entries={reviewEntries}
            isLoading={isReviewLoading}
            onUpdateStatus={handleUpdateReviewStatus}
          />
        )}

        <LogTimesheetModal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          onSubmit={handleCreateEntry}
          isLoading={logMutation.isPending}
        />

        <ConfirmDialog
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Timesheet Entry"
          description="Are you sure you want to delete this daily work record? This cannot be undone."
          confirmText="Delete Entry"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
