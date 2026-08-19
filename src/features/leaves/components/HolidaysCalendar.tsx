"use client";

import React from "react";
import { Holiday } from "../types/leave-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/use-auth-store";
import { PERMISSIONS } from "@/constants";

import { format, parseISO, isValid } from "date-fns";

interface HolidaysCalendarProps {
  holidays: Holiday[];
  isLoading: boolean;
  onAddHoliday?: () => void;
}

export function HolidaysCalendar({ holidays, isLoading, onAddHoliday }: HolidaysCalendarProps) {
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission(PERMISSIONS.LEAVE_MANAGE_TYPES);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading company holiday schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Official Corporate Holidays ({holidays.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Days automatically excluded from employee leave quota deductions
          </p>
        </div>

        {canManage && onAddHoliday && (
          <Button variant="gradient" onClick={onAddHoliday} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {holidays.map((h) => {
          const parsed = parseISO(h.holiday_date);
          const day = isValid(parsed) ? format(parsed, "EEE") : "—";
          const dayNum = isValid(parsed) ? format(parsed, "d") : "—";
          const dateStr = isValid(parsed) ? format(parsed, "MMM d, yyyy") : h.holiday_date;

          return (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-400 shrink-0">
                  <span className="text-[10px] uppercase font-bold">{day}</span>
                  <span className="text-xs font-extrabold">{dayNum}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{h.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{dateStr}</div>
                </div>
              </div>

              <StatusBadge status="Official" variant="system" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
