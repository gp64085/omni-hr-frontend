import React from "react";
import clsx from "clsx";

export type StatusVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "active"
  | "inactive"
  | "completed"
  | "on_hold"
  | "draft"
  | "system"
  | "custom"
  | "billable"
  | "non_billable";

interface StatusBadgeProps {
  status?: string | null;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const rawStatus = status || variant || "unknown";
  const normStatus = (variant || status || "").toLowerCase().replace("-", "_");

  const styleMap: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    submitted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    on_hold: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    system: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    custom: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    billable: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    non_billable: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const currentStyle = styleMap[normStatus] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide",
        currentStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {rawStatus.replace(/_/g, " ")}
    </span>
  );
}
