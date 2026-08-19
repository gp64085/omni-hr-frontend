"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { leavesApi } from "@/features/leaves/api/leaves-api";
import { timesheetsApi } from "@/features/timesheets/api/timesheets-api";
import { LeaveRequestCreatePayload } from "@/features/leaves/types/leave-types";
import {
  TimesheetEntryCreatePayload,
  TimesheetProjectAllocation,
  TimesheetTaskDetail,
} from "@/features/timesheets/types/timesheet-types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApplyLeaveModal } from "@/features/leaves/components/ApplyLeaveModal";
import { LogTimesheetModal } from "@/features/timesheets/components/LogTimesheetModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useDashboardCalendar } from "@/features/dashboard/hooks/useDashboardCalendar";
import { getApiErrorMessage } from "@/lib/error-utils";
import { formatMinutesToHHMM } from "@/lib/date-utils";
import { MONTH_NAMES, WEEK_DAYS_FULL, WEEK_DAYS_SHORT } from "@/constants";

export function DashboardCalendar() {
  const { success, error } = useToast();

  const {
    currentYear,
    currentMonth,
    todayStr,
    isLoading,
    daysInMonth,
    startOffset,
    refreshCalendar,
    handlePrevMonth,
    handleNextMonth,
    handleJumpToday,
    getEventsForDate,
  } = useDashboardCalendar();

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);
  const [logWorkModalOpen, setLogWorkModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const selectedDateEvents = useMemo(
    () => (selectedDateStr ? getEventsForDate(selectedDateStr) : null),
    [selectedDateStr, getEventsForDate]
  );

  const handleApplyLeaveSubmit = useCallback(
    async (payload: LeaveRequestCreatePayload) => {
      setActionLoading(true);
      try {
        await leavesApi.applyLeave(payload);
        success("Leave Request Submitted", "Request sent for manager approval.");
        setApplyLeaveModalOpen(false);
        setSelectedDateStr(null);
        refreshCalendar();
      } catch (errorResponse) {
        error("Application Failed", getApiErrorMessage(errorResponse));
      } finally {
        setActionLoading(false);
      }
    },
    [success, error, refreshCalendar]
  );

  const handleLogWorkSubmit = useCallback(
    async (payload: TimesheetEntryCreatePayload) => {
      setActionLoading(true);
      try {
        await timesheetsApi.createEntry(payload);
        const totalMinutes = payload.total_minutes_spent || 0;
        success(
          "Work Logged",
          `Recorded timesheet entries (${formatMinutesToHHMM(totalMinutes)}) for ${payload.work_date}.`
        );
        setLogWorkModalOpen(false);
        setSelectedDateStr(null);
        refreshCalendar();
      } catch (errorResponse) {
        error("Log Failed", getApiErrorMessage(errorResponse));
      } finally {
        setActionLoading(false);
      }
    },
    [success, error, refreshCalendar]
  );

  return (
    <div className="space-y-4">
      {/* Calendar Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {MONTH_NAMES[currentMonth]} {currentYear} Workspace Calendar
                </h3>
                {isLoading && (
                  <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="text-xs text-slate-400">
                Track scheduled leaves, daily logged timesheets, and official company holidays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-xs text-slate-200 px-3 min-w-28 text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Company Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Logged Hours (Timesheet)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Approved Leave</span>
          </div>
        </div>

        {/* Calendar Grid Table */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden backdrop-blur-sm">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold text-center">
            {WEEK_DAYS_FULL.map((day) => (
              <div key={day} className="py-2.5 hidden md:block">
                {day}
              </div>
            ))}
            {WEEK_DAYS_SHORT.map((day) => (
              <div key={day} className="py-2.5 md:hidden">
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/40">
            {/* Start padding for previous month offset */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-24 sm:min-h-28 p-2 bg-slate-950/30 opacity-20"
              />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const events = getEventsForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={clsx(
                    "min-h-24 sm:min-h-28 p-1.5 sm:p-2 transition-all flex flex-col justify-between cursor-pointer group hover:bg-slate-900/70 relative",
                    isToday && "bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/40"
                  )}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isToday
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/50"
                          : "text-slate-300 group-hover:text-white"
                      )}
                    >
                      {dayNum}
                    </span>

                    {events.totalMinutes > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {formatMinutesToHHMM(events.totalMinutes)}
                      </span>
                    )}
                  </div>

                  {/* Event Badges list */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {/* Holidays */}
                    {events.holidays.map((h) => (
                      <div
                        key={h.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium"
                        title={h.name}
                      >
                        🎉 {h.name}
                      </div>
                    ))}

                    {/* Leaves */}
                    {events.leaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded font-medium border bg-purple-500/15 border-purple-500/30 text-purple-300"
                        title={`🌴 ${leave.leave_type?.name || "Leave"} (Approved)`}
                      >
                        🌴 {leave.leave_type?.name || "Leave"}
                      </div>
                    ))}

                    {/* Timesheets entries */}
                    {events.timesheets.slice(0, 2).map((timesheet) => {
                      const tMinutes = Number(timesheet.total_minutes_spent) || 0;
                      return (
                        <div
                          key={timesheet.id}
                          className="truncate text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono"
                          title={`${formatMinutesToHHMM(tMinutes)} - ${typeof timesheet.activity_summary === "string" ? timesheet.activity_summary : "Project Tasks"}`}
                        >
                          ⏱️ {formatMinutesToHHMM(tMinutes)}{" "}
                          {timesheet.project_name || timesheet.project?.code || ""}
                        </div>
                      );
                    })}
                    {events.timesheets.length > 2 && (
                      <div className="text-[9px] text-slate-500 px-1">
                        +{events.timesheets.length - 2} more logs
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 group-hover:text-indigo-400 transition-colors flex items-center justify-end">
                    <span className="opacity-0 group-hover:opacity-100 font-semibold">
                      Inspect →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedDateStr)}
        onClose={() => setSelectedDateStr(null)}
        title={selectedDateStr ? `Activity for ${selectedDateStr}` : "Day Details"}
        maxWidth="lg"
      >
        {selectedDateEvents && selectedDateStr && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Date: {selectedDateStr}</span>
                  {selectedDateStr === todayStr && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                      Today
                    </span>
                  )}
                  {selectedDateEvents.isWeekend && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Weekend
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Quickly request a leave or log your timesheet tasks for this date
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setApplyLeaveModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Leave</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setLogWorkModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Log Work</span>
                </Button>
              </div>
            </div>

            {/* Holidays List */}
            {selectedDateEvents.holidays.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Company Holiday</span>
                </h4>
                {selectedDateEvents.holidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs"
                  >
                    <div className="font-bold text-white">{h.name}</div>
                    <div className="text-[11px] text-indigo-300 mt-0.5">
                      Official company holiday (no working day deductions)
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leaves List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Approved Leaves ({selectedDateEvents.leaves.length})</span>
              </h4>
              {selectedDateEvents.leaves.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No approved leaves for this date.
                </div>
              ) : (
                selectedDateEvents.leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white capitalize">
                        {l.leave_type?.name || "Leave"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        Approved
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Duration: {l.start_date} to {l.end_date} ({l.total_days} days)
                    </div>
                    {l.reason && (
                      <div className="text-[11px] text-slate-300 italic">
                        &ldquo;{l.reason}&rdquo;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Timesheet Logs List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged Timesheets ({selectedDateEvents.timesheets.length})</span>
                </h4>
                {selectedDateEvents.totalMinutes > 0 && (
                  <span className="text-xs font-extrabold text-white font-mono">
                    Total: {formatMinutesToHHMM(selectedDateEvents.totalMinutes)}
                  </span>
                )}
              </div>

              {selectedDateEvents.timesheets.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No work hours logged on this date yet.
                </div>
              ) : (
                selectedDateEvents.timesheets.map((timesheet) => {
                  const entryMinutes = Number(timesheet.total_minutes_spent) || 0;
                  return (
                    <div
                      key={timesheet.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {timesheet.project_name || timesheet.project?.name || "Project Work"}
                        </span>
                        <span className="font-extrabold font-mono text-emerald-400">
                          {formatMinutesToHHMM(entryMinutes)}
                        </span>
                      </div>
                      {typeof timesheet.activity_summary === "string" ? (
                        <div className="text-[11px] text-slate-300">
                          {timesheet.activity_summary}
                        </div>
                      ) : Array.isArray(timesheet.activity_summary) ? (
                        <div className="space-y-0.5 pt-1">
                          {timesheet.activity_summary.map(
                            (
                              alloc:
                                | TimesheetProjectAllocation
                                | TimesheetTaskDetail
                                | Record<string, unknown>,
                              index: number
                            ) => {
                              const tasks =
                                "tasks" in alloc && Array.isArray(alloc.tasks) ? alloc.tasks : null;
                              const projName =
                                "project_name" in alloc && alloc.project_name
                                  ? alloc.project_name
                                  : "Project";
                              const summary =
                                "summary" in alloc && typeof alloc.summary === "string"
                                  ? alloc.summary
                                  : JSON.stringify(alloc);
                              return (
                                <div key={index} className="text-[11px] text-slate-300">
                                  {tasks ? (
                                    <div>
                                      <span className="font-semibold text-indigo-300">
                                        {String(projName)}:{" "}
                                      </span>
                                      <span>
                                        {tasks.map((task) => String(task.summary || "")).join(", ")}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>{summary}</span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                        <span>Total: {formatMinutesToHHMM(entryMinutes)}</span>
                        <span>•</span>
                        <span className="uppercase">{timesheet.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setSelectedDateStr(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sub-modals prefilled with date */}
      {applyLeaveModalOpen && (
        <ApplyLeaveModal
          isOpen={applyLeaveModalOpen}
          onClose={() => setApplyLeaveModalOpen(false)}
          onSubmit={handleApplyLeaveSubmit}
          isLoading={actionLoading}
          defaultStartDate={selectedDateStr || todayStr}
          defaultEndDate={selectedDateStr || todayStr}
        />
      )}

      {logWorkModalOpen && (
        <LogTimesheetModal
          isOpen={logWorkModalOpen}
          onClose={() => setLogWorkModalOpen(false)}
          onSubmit={handleLogWorkSubmit}
          isLoading={actionLoading}
          defaultWorkDate={selectedDateStr || todayStr}
        />
      )}
    </div>
  );
}
