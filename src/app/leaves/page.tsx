"use client";

import React, { useState } from "react";
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
import {
  LeaveRequest,
  LeaveRequestCreatePayload,
  LeaveStatusUpdatePayload,
} from "@/features/leaves/types/leave-types";
import { useAuthStore } from "@/store/use-auth-store";
import { PAGINATION, PERMISSIONS, LEAVE_STATUS } from "@/constants";
import {
  useLeaveBalancesQuery,
  useMyLeaveRequestsQuery,
  useTeamLeaveRequestsQuery,
  useHolidaysQuery,
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useUpdateLeaveStatusMutation,
  useCreateHolidayMutation,
  useTriggerAccrualsMutation,
} from "@/features/leaves/hooks/use-leaves-queries";

export default function LeavesPage() {
  const { user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState("my_leaves");

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [accrualConfirmOpen, setAccrualConfirmOpen] = useState(false);

  const canApprove = hasPermission(PERMISSIONS.LEAVE_APPROVE);
  const canManageHolidays = hasPermission(PERMISSIONS.LEAVE_MANAGE_TYPES);

  // Queries
  const { data: balances = [], isLoading: isBalancesLoading } = useLeaveBalancesQuery();
  const { data: myReqsData, isLoading: isMyReqsLoading } = useMyLeaveRequestsQuery({
    limit: PAGINATION.DEFAULT_LIMIT,
  });
  const { data: teamReqsData, isLoading: isTeamReqsLoading } = useTeamLeaveRequestsQuery(
    {
      status: LEAVE_STATUS.PENDING,
      limit: PAGINATION.DEFAULT_LIMIT,
    },
    { enabled: canApprove }
  );
  const { data: holidays = [], isLoading: isHolidaysLoading } = useHolidaysQuery();

  // Mutations
  const applyMutation = useApplyLeaveMutation();
  const cancelMutation = useCancelLeaveMutation();
  const updateStatusMutation = useUpdateLeaveStatusMutation();
  const createHolidayMutation = useCreateHolidayMutation();
  const triggerAccrualsMutation = useTriggerAccrualsMutation();

  const myRequests = myReqsData?.data || [];
  const teamRequests = (teamReqsData?.data || []).filter((r) => r.user_id !== user?.id);

  const handleApplyLeave = async (payload: LeaveRequestCreatePayload) => {
    await applyMutation.mutateAsync(payload);
    setApplyModalOpen(false);
  };

  const handleConfirmCancelLeave = async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
  };

  const handleUpdateStatus = async (id: string, payload: LeaveStatusUpdatePayload) => {
    await updateStatusMutation.mutateAsync({ id, payload });
  };

  const handleCreateHoliday = async (payload: {
    name: string;
    holiday_date: string;
    is_recurring?: boolean;
  }) => {
    await createHolidayMutation.mutateAsync(payload);
    setHolidayModalOpen(false);
  };

  const handleConfirmTriggerAccruals = async () => {
    await triggerAccrualsMutation.mutateAsync();
    setAccrualConfirmOpen(false);
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
            <Button
              variant="secondary"
              onClick={() => setAccrualConfirmOpen(true)}
              disabled={triggerAccrualsMutation.isPending}
              className="flex items-center gap-2"
              title="Run Accrual Engine"
            >
              <RefreshCw
                className={`w-4 h-4 text-indigo-400 ${triggerAccrualsMutation.isPending ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Run Accruals</span>
            </Button>
          )}

          <Button
            variant="gradient"
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <LeaveBalancesGrid balances={balances} isLoading={isBalancesLoading} />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "my_leaves" && (
          <LeaveRequestsTable
            requests={myRequests}
            isLoading={isMyReqsLoading}
            onCancel={(req) => setCancelTarget(req)}
          />
        )}

        {activeTab === "team_approvals" && (
          <TeamApprovalsQueue
            requests={teamRequests}
            isLoading={isTeamReqsLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === "holidays" && (
          <HolidaysCalendar
            holidays={holidays}
            isLoading={isHolidaysLoading}
            onAddHoliday={canManageHolidays ? () => setHolidayModalOpen(true) : undefined}
          />
        )}

        <ApplyLeaveModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSubmit={handleApplyLeave}
          isLoading={applyMutation.isPending}
        />

        <CreateHolidayModal
          isOpen={holidayModalOpen}
          onClose={() => setHolidayModalOpen(false)}
          onSubmit={handleCreateHoliday}
          isLoading={createHolidayMutation.isPending}
        />

        <ConfirmDialog
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancelLeave}
          title="Cancel Leave Request"
          description={`Are you sure you want to cancel your ${cancelTarget?.leave_type?.name || "leave"} request for ${cancelTarget?.start_date}? Your allocated leave balance will be restored.`}
          confirmText="Cancel Leave"
          variant="danger"
          isLoading={cancelMutation.isPending}
        />

        <ConfirmDialog
          isOpen={accrualConfirmOpen}
          onClose={() => setAccrualConfirmOpen(false)}
          onConfirm={handleConfirmTriggerAccruals}
          title="Trigger Periodic Accruals"
          description="This will execute the automated accrual engine across all eligible employee accounts according to corporate policy."
          confirmText="Execute Accruals"
          variant="gradient"
          isLoading={triggerAccrualsMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
