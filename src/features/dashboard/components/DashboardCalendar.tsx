"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { leavesApi, holidaysApi } from "@/features/leaves/api/leaves-api";
import { timesheetsApi } from "@/features/timesheets/api/timesheets-api";
import {
  LeaveRequest,
  Holiday,
  LeaveRequestCreatePayload,
} from "@/features/leaves/types/leave-types";
import {
  TimesheetEntry,
  TimesheetEntryCreatePayload,
} from "@/features/timesheets/types/timesheet-types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApplyLeaveModal } from "@/features/leaves/components/ApplyLeaveModal";
import { LogTimesheetModal } from "@/features/timesheets/components/LogTimesheetModal";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { MONTH_NAMES, WEEK_DAYS_FULL, WEEK_DAYS_SHORT, PAGINATION } from "@/constants";

export function DashboardCalendar() {
  const { success, error } = useToast();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected date inspector modal
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Sub-modals for quick actions from the calendar
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);
  const [logWorkModalOpen, setLogWorkModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load calendar events for current view
  useEffect(() => {
    let isMounted = true;
    const fetchMonthData = async () => {
      const firstDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      const lastDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      try {
        const [leavesRes, holidaysRes, timesheetRes] = await Promise.all([
          leavesApi.listLeaveRequests({ limit: PAGINATION.MAX_LIMIT }).catch(() => ({ data: [] })),
          holidaysApi.listHolidays(currentYear).catch(() => ({ data: [] })),
          timesheetsApi
            .listEntries({
              start_date: firstDayStr,
              end_date: lastDayStr,
              limit: PAGINATION.MAX_LIMIT,
            })
            .catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          if (leavesRes.data) setLeaves(leavesRes.data);
          if (holidaysRes.data) setHolidays(holidaysRes.data);
          if (timesheetRes.data) setTimesheets(timesheetRes.data);
        }
      } catch (err) {
        console.error("Failed to load month calendar events", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMonthData();
    return () => {
      isMounted = false;
    };
  }, [currentYear, currentMonth, refreshTrigger]);

  const handlePrevMonth = () => {
    setIsLoading(true);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setIsLoading(true);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setIsLoading(true);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Month grid calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startOffset = (firstDayOfWeek + 6) % 7; // Monday = 0, Sunday = 6

  // Helper to get events for a given YYYY-MM-DD
  const getEventsForDate = (dateStr: string) => {
    const dayHolidays = holidays.filter((h) => h.holiday_date === dateStr);
    const dayLeaves = leaves.filter((l) => dateStr >= l.start_date && dateStr <= l.end_date);
    const dayTimesheets = timesheets.filter((t) => t.work_date === dateStr);

    const totalHours = dayTimesheets.reduce((acc, t) => acc + (t.hours_spent || 0), 0);

    return {
      holidays: dayHolidays,
      leaves: dayLeaves,
      timesheets: dayTimesheets,
      totalHours,
      hasEvents: dayHolidays.length > 0 || dayLeaves.length > 0 || dayTimesheets.length > 0,
    };
  };

  const selectedDateEvents = selectedDateStr ? getEventsForDate(selectedDateStr) : null;

  const handleApplyLeaveSubmit = async (payload: LeaveRequestCreatePayload) => {
    setActionLoading(true);
    try {
      await leavesApi.applyLeave(payload);
      success("Leave Request Submitted", "Request sent for manager approval.");
      setApplyLeaveModalOpen(false);
      setSelectedDateStr(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Application Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogWorkSubmit = async (payloads: TimesheetEntryCreatePayload[]) => {
    setActionLoading(true);
    try {
      if (payloads.length === 1) {
        await timesheetsApi.createEntry(payloads[0]);
      } else {
        await timesheetsApi.createBatchEntries({ entries: payloads });
      }
      const totalHours = payloads.reduce((acc, p) => acc + p.hours_spent, 0);
      success(
        "Work Logged",
        `Recorded ${payloads.length} task entries (${totalHours.toFixed(1)}h) for ${payloads[0]?.work_date}.`
      );
      setLogWorkModalOpen(false);
      setSelectedDateStr(null);
      setIsLoading(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      error("Log Failed", getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

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
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending Leave Request</span>
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

                    {events.totalHours > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {events.totalHours.toFixed(1)}h
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
                    {events.leaves.map((l) => (
                      <div
                        key={l.id}
                        className={clsx(
                          "truncate text-[10px] px-1.5 py-0.5 rounded font-medium border",
                          l.status === "approved"
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                            : l.status === "pending"
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                              : "bg-slate-800 border-slate-700 text-slate-400"
                        )}
                        title={`${l.leave_type?.name || "Leave"} (${l.status})`}
                      >
                        🌴 {l.leave_type?.name || "Leave"} ({l.status})
                      </div>
                    ))}

                    {/* Timesheets entries */}
                    {events.timesheets.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono"
                        title={`${t.hours_spent}h - ${t.activity_summary}`}
                      >
                        ⏱️ {t.hours_spent}h {t.project_name || t.project?.code || ""}
                      </div>
                    ))}
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

      {/* Selected Day Inspector Modal */}
      <Modal
        isOpen={!!selectedDateStr}
        onClose={() => setSelectedDateStr(null)}
        title={`Daily Schedule & Activity: ${selectedDateStr}`}
        description="Consolidated timeline of scheduled leaves, logged project timesheets, and observed holidays for this date."
        maxWidth="xl"
      >
        {selectedDateStr && selectedDateEvents && (
          <div className="space-y-5">
            {/* Quick Actions for this Date */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 pl-1">
                Actions for {selectedDateStr}:
              </span>
              <div className="flex-1 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setApplyLeaveModalOpen(true)}
                  className="flex items-center gap-1 text-xs py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Leave</span>
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => setLogWorkModalOpen(true)}
                  className="flex items-center gap-1 text-xs py-1.5"
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
                <span>Leave Status ({selectedDateEvents.leaves.length})</span>
              </h4>
              {selectedDateEvents.leaves.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No leaves booked for this date.
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {l.status}
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
                {selectedDateEvents.totalHours > 0 && (
                  <span className="text-xs font-extrabold text-white">
                    Total: {selectedDateEvents.totalHours.toFixed(1)} hrs
                  </span>
                )}
              </div>

              {selectedDateEvents.timesheets.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No work hours logged on this date yet.
                </div>
              ) : (
                selectedDateEvents.timesheets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {t.project_name || t.project?.name || "Project Work"}
                      </span>
                      <span className="font-extrabold font-mono text-emerald-400">
                        {(t.hours_spent || 0).toFixed(1)} hrs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{t.activity_summary}</p>
                    <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                      <span>{t.is_billable ? "Billable Client Time" : "Internal Activity"}</span>
                      <span>•</span>
                      <span className="uppercase">{t.status}</span>
                    </div>
                  </div>
                ))
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
        />
      )}

      {logWorkModalOpen && (
        <LogTimesheetModal
          isOpen={logWorkModalOpen}
          onClose={() => setLogWorkModalOpen(false)}
          onSubmit={handleLogWorkSubmit}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
