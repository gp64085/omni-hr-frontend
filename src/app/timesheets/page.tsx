"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WeeklySummaryBar } from "@/features/timesheets/components/WeeklySummaryBar";
import { WeeklyTimesheetGrid } from "@/features/timesheets/components/WeeklyTimesheetGrid";
import { ManagerTimesheetReview } from "@/features/timesheets/components/ManagerTimesheetReview";
import { LogTimesheetModal } from "@/features/timesheets/components/LogTimesheetModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Clock, CheckSquare, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { timesheetsApi } from "@/features/timesheets/api/timesheets-api";
import {
  TimesheetEntry,
  TimesheetEntryCreatePayload,
  WeeklyTimesheetSummary,
} from "@/features/timesheets/types/timesheet-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/ToastProvider";
import { getWeekDates } from "@/lib/date-utils";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PAGINATION, PERMISSIONS, TIMESHEET_STATUS } from "@/constants";

export default function TimesheetsPage() {
  const { hasPermission } = useAuthStore();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState("my_timesheet");
  const [weekOffset, setWeekOffset] = useState(0);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [reviewEntries, setReviewEntries] = useState<TimesheetEntry[]>([]);
  const [summary, setSummary] = useState<WeeklyTimesheetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & confirmation targets
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [submitWeeklyConfirmOpen, setSubmitWeeklyConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canApprove = hasPermission(PERMISSIONS.TIMESHEET_APPROVE);

  useEffect(() => {
    let isMounted = true;
    const { startDate, endDate } = getWeekDates(weekOffset);

    const loadTimesheetData = async () => {
      try {
        const entriesRes = await timesheetsApi.listEntries({
          start_date: startDate,
          end_date: endDate,
          limit: PAGINATION.DEFAULT_LIMIT,
        });
        if (isMounted && entriesRes.data) {
          setEntries(entriesRes.data);
        }

        const summaryRes = await timesheetsApi.getWeeklySummary({
          start_date: startDate,
          end_date: endDate,
        });
        if (isMounted && summaryRes.data) {
          setSummary(summaryRes.data);
        }

        if (canApprove) {
          const reviewRes = await timesheetsApi.listEntries({
            status: TIMESHEET_STATUS.SUBMITTED,
            limit: PAGINATION.DEFAULT_LIMIT,
          });
          if (isMounted && reviewRes.data) {
            setReviewEntries(reviewRes.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          error("Failed to load timesheet data", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTimesheetData();
    return () => {
      isMounted = false;
    };
  }, [weekOffset, canApprove, refreshTrigger, error]);

  const handleCreateEntry = async (payload: TimesheetEntryCreatePayload) => {
    setActionLoading(true);
    try {
      await timesheetsApi.createEntry(payload);
      success("Work Logged", `Recorded ${payload.hours_spent}h for ${payload.work_date}.`);
      setLogModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Log Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setActionLoading(true);
    try {
      await timesheetsApi.deleteEntry(deleteTargetId);
      success("Entry Deleted", "Timesheet record removed.");
      setDeleteTargetId(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Delete Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSubmitWeekly = async () => {
    const { startDate, endDate } = getWeekDates(weekOffset);
    setActionLoading(true);
    try {
      const res = await timesheetsApi.submitTimesheets({
        start_date: startDate,
        end_date: endDate,
      });
      success("Timesheet Submitted", res.data?.message || "Submitted for manager review.");
      setSubmitWeeklyConfirmOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Submission Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReviewStatus = async (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      await timesheetsApi.updateEntryStatus(id, {
        status,
        rejection_reason: reason,
      });
      success(
        status === "approved" ? "Timesheet Approved" : "Timesheet Rejected",
        "Decision recorded."
      );
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Decision Failed", getApiErrorMessage(err));
    }
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

  const { formattedRange, startDate, endDate } = getWeekDates(weekOffset);

  return (
    <AppShell
      title="Timesheets & Work Tracking"
      subtitle="Log daily project tasks, track billability, and submit weekly hours for sign-off"
      actions={
        <Button
          variant="gradient"
          onClick={() => setLogModalOpen(true)}
          className="flex items-center gap-2 text-xs py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Daily Work</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <WeeklySummaryBar summary={summary} isLoading={isLoading} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "my_timesheet" && (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => {
                  setWeekOffset((prev) => prev - 1);
                  setIsLoading(true);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-200 px-2">
                {formattedRange} {weekOffset === 0 && "(This Week)"}
              </span>
              <button
                onClick={() => {
                  setWeekOffset((prev) => prev + 1);
                  setIsLoading(true);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {activeTab === "my_timesheet" ? (
          <WeeklyTimesheetGrid
            entries={entries}
            isLoading={isLoading}
            onDelete={(id) => setDeleteTargetId(id)}
            onSubmitWeekly={() => setSubmitWeeklyConfirmOpen(true)}
            isSubmitting={actionLoading}
          />
        ) : (
          <ManagerTimesheetReview
            entries={reviewEntries}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateReviewStatus}
          />
        )}

        <LogTimesheetModal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          onSubmit={handleCreateEntry}
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Timesheet Entry"
          description="Are you sure you want to delete this daily work record? This cannot be undone."
          confirmText="Delete Entry"
          variant="danger"
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={submitWeeklyConfirmOpen}
          onClose={() => setSubmitWeeklyConfirmOpen(false)}
          onConfirm={handleConfirmSubmitWeekly}
          title="Submit Weekly Timesheet"
          description={`Submit all draft work logs for the week (${startDate} to ${endDate}) for formal manager sign-off? Once submitted, entries are locked.`}
          confirmText="Submit Timesheet"
          variant="gradient"
          isLoading={actionLoading}
        />
      </div>
    </AppShell>
  );
}
