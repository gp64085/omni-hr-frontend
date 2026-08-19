"use client";

import React from "react";
import { WeeklyTimesheetSummary } from "../types/timesheet-types";
import { Clock } from "lucide-react";
import { TIMESHEET_CONSTANTS } from "@/constants";

import { formatDecimalHoursToHHMM } from "@/lib/date-utils";

interface WeeklySummaryBarProps {
  summary: WeeklyTimesheetSummary | null;
  isLoading: boolean;
}

export function WeeklySummaryBar({ summary, isLoading }: WeeklySummaryBarProps) {
  if (isLoading || !summary) {
    return (
      <div className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
    );
  }

  const total = summary.total_hours || 0;
  const billable = summary.billable_hours || 0;
  const nonBillable = summary.non_billable_hours || 0;
  const target = TIMESHEET_CONSTANTS.STANDARD_WEEKLY_HOURS;
  const targetPercent = Math.min(100, Math.round((total / target) * 100));

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Weekly Work Summary ({summary.start_date} to {summary.end_date})
            </h3>
            <p className="text-xs text-slate-400">
              Standard corporate expectation:{" "}
              <strong className="text-slate-200">{formatDecimalHoursToHHMM(target)} / week</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <div className="text-slate-400 text-[11px]">Total Logged</div>
            <div className="text-lg font-extrabold text-white font-mono">
              {formatDecimalHoursToHHMM(total)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-emerald-400 text-[11px]">Billable</div>
            <div className="text-lg font-extrabold text-emerald-400 font-mono">
              {formatDecimalHoursToHHMM(billable)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-slate-400 text-[11px]">Internal / Admin</div>
            <div className="text-lg font-extrabold text-slate-300 font-mono">
              {formatDecimalHoursToHHMM(nonBillable)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Weekly Target Progress</span>
          <span className="font-semibold text-white">{targetPercent}% reached</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${targetPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
