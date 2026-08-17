"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveBalancesGrid } from "@/features/leaves/components/LeaveBalancesGrid";
import { LeaveRequestsTable } from "@/features/leaves/components/LeaveRequestsTable";
import { TeamApprovalsQueue } from "@/features/leaves/components/TeamApprovalsQueue";
import { HolidaysCalendar } from "@/features/leaves/components/HolidaysCalendar";
import { ApplyLeaveModal } from "@/features/leaves/components/ApplyLeaveModal";
import { CreateHolidayModal } from "@/features/leaves/components/CreateHolidayModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Calendar, CheckCircle, CalendarDays, Plus, RefreshCw } from "lucide-react";
import { leavesApi, holidaysApi } from "@/features/leaves/api/leaves-api";
import {
  Holiday,
  LeaveAllocation,
  LeaveRequest,
  LeaveRequestCreatePayload,
} from "@/features/leaves/types/leave-types";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PAGINATION, PERMISSIONS, LEAVE_STATUS } from "@/constants";

export default function LeavesPage() {
  const { hasPermission } = useAuthStore();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState("my_leaves");
  const [balances, setBalances] = useState<LeaveAllocation[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & confirmation targets
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [accrualConfirmOpen, setAccrualConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canApprove = hasPermission(PERMISSIONS.LEAVE_APPROVE);
  const canManageHolidays = hasPermission(PERMISSIONS.LEAVE_MANAGE_TYPES);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const balancesRes = await leavesApi.getLeaveBalance();
        if (isMounted && balancesRes.data) setBalances(balancesRes.data);

        const myReqsRes = await leavesApi.listLeaveRequests({ limit: PAGINATION.DEFAULT_LIMIT });
        if (isMounted && myReqsRes.data) setMyRequests(myReqsRes.data);

        if (canApprove) {
          const teamReqsRes = await leavesApi.listLeaveRequests({
            status: LEAVE_STATUS.PENDING,
            limit: PAGINATION.DEFAULT_LIMIT,
          });
          if (isMounted && teamReqsRes.data) setTeamRequests(teamReqsRes.data);
        }

        const holidaysRes = await holidaysApi.listHolidays();
        if (isMounted && holidaysRes.data) setHolidays(holidaysRes.data);
      } catch (err) {
        if (isMounted) {
          error("Failed to load leave records", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [canApprove, refreshTrigger, error]);

  const handleApplyLeave = async (payload: LeaveRequestCreatePayload) => {
    setActionLoading(true);
    try {
      await leavesApi.applyLeave(payload);
      success("Leave Request Submitted", "Your request is pending manager review.");
      setApplyModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Application Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancelLeave = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await leavesApi.cancelLeave(cancelTarget.id);
      success("Leave Cancelled", "Request has been cancelled and quota restored.");
      setCancelTarget(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Cancellation Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected",
    comments?: string
  ) => {
    try {
      await leavesApi.updateLeaveStatus(id, {
        status,
        approver_comments: comments,
      });
      success(
        status === "approved" ? "Leave Approved" : "Leave Rejected",
        "Decision logged and notification dispatched."
      );
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Status Update Failed", getApiErrorMessage(err));
    }
  };

  const handleCreateHoliday = async (payload: {
    name: string;
    holiday_date: string;
    is_recurring?: boolean;
  }) => {
    setActionLoading(true);
    try {
      await holidaysApi.createHoliday(payload);
      success("Holiday Added", `${payload.name} added to company calendar.`);
      setHolidayModalOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Failed to add holiday", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmTriggerAccruals = async () => {
    setActionLoading(true);
    try {
      const res = await leavesApi.triggerAccruals();
      success("Accrual Engine Executed", res.data?.message || "Quotas updated.");
      setAccrualConfirmOpen(false);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Accrual Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: "my_leaves", label: "My Leave Portal", icon: Calendar, count: myRequests.length },
    ...(canApprove
      ? [
          {
            id: "team_approvals",
            label: "Team Approvals Queue",
            icon: CheckCircle,
            count: teamRequests.length,
          },
        ]
      : []),
    { id: "holidays", label: "Company Holidays", icon: CalendarDays, count: holidays.length },
  ];

  return (
    <AppShell
      title="Leaves & Time Off"
      subtitle="Track leave balances, submit time-off requests, and manage team approvals"
      actions={
        <div className="flex items-center gap-2">
          {canManageHolidays && (
            <button
              onClick={() => setAccrualConfirmOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Run Accrual Engine"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Run Accruals</span>
            </button>
          )}

          <Button
            variant="gradient"
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center gap-1.5 text-xs py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <LeaveBalancesGrid balances={balances} isLoading={isLoading} />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "my_leaves" && (
          <LeaveRequestsTable
            requests={myRequests}
            isLoading={isLoading}
            onCancel={(req) => setCancelTarget(req)}
          />
        )}

        {activeTab === "team_approvals" && (
          <TeamApprovalsQueue
            requests={teamRequests}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === "holidays" && (
          <HolidaysCalendar
            holidays={holidays}
            isLoading={isLoading}
            onAddHoliday={canManageHolidays ? () => setHolidayModalOpen(true) : undefined}
          />
        )}

        <ApplyLeaveModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSubmit={handleApplyLeave}
          isLoading={actionLoading}
        />

        <CreateHolidayModal
          isOpen={holidayModalOpen}
          onClose={() => setHolidayModalOpen(false)}
          onSubmit={handleCreateHoliday}
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancelLeave}
          title="Cancel Leave Request"
          description={`Are you sure you want to cancel your ${cancelTarget?.leave_type?.name || "leave"} request for ${cancelTarget?.start_date}? Your allocated leave balance will be restored.`}
          confirmText="Cancel Leave"
          variant="danger"
          isLoading={actionLoading}
        />

        <ConfirmDialog
          isOpen={accrualConfirmOpen}
          onClose={() => setAccrualConfirmOpen(false)}
          onConfirm={handleConfirmTriggerAccruals}
          title="Trigger Periodic Accruals"
          description="This will execute the automated accrual engine across all eligible employee accounts according to corporate policy."
          confirmText="Execute Accruals"
          variant="gradient"
          isLoading={actionLoading}
        />
      </div>
    </AppShell>
  );
}
