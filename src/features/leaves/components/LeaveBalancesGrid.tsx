"use client";

import React from "react";
import { LeaveAllocation } from "../types/leave-types";
import { Calendar, HeartPulse, Sparkles, AlertCircle } from "lucide-react";

interface LeaveBalancesGridProps {
  balances: LeaveAllocation[];
  isLoading: boolean;
}

export function LeaveBalancesGrid({ balances, isLoading }: LeaveBalancesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const iconMap: Record<string, React.ReactNode> = {
    casual: <Calendar className="w-5 h-5 text-indigo-400" />,
    sick: <HeartPulse className="w-5 h-5 text-rose-400" />,
    earned: <Sparkles className="w-5 h-5 text-amber-400" />,
    unpaid: <AlertCircle className="w-5 h-5 text-purple-400" />,
  };

  const borderMap: Record<string, string> = {
    casual: "border-indigo-500/20 bg-indigo-950/10",
    sick: "border-rose-500/20 bg-rose-950/10",
    earned: "border-amber-500/20 bg-amber-950/10",
    unpaid: "border-purple-500/20 bg-purple-950/10",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {balances.map((b) => {
        const typeName = b.leave_type?.name?.toLowerCase() || "other";
        const icon = iconMap[typeName] || <Calendar className="w-5 h-5 text-indigo-400" />;
        const borderStyle = borderMap[typeName] || "border-slate-800 bg-slate-900/60";

        const total = b.allocated_days || 1;
        const used = b.used_days || 0;
        const remaining = b.remaining_days || 0;
        const percent = Math.min(100, Math.round((used / total) * 100));

        return (
          <div
            key={b.id}
            className={`p-5 rounded-2xl border backdrop-blur-sm relative overflow-hidden transition-all hover:scale-[1.01] ${borderStyle}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider capitalize">
                {b.leave_type?.name || "Leave"}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">{icon}</div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white tracking-tight">
                {remaining}{" "}
                <span className="text-xs font-medium text-slate-400">/ {total} Days</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{used} Used</span>
                <span>{b.pending_days > 0 ? `${b.pending_days} Pending` : "0 Pending"}</span>
              </div>
            </div>

            {/* Meter */}
            <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
