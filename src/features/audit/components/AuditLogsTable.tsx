"use client";

import React from "react";
import { AuditLog } from "../types/audit-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Eye, ScrollText } from "lucide-react";

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onInspect: (log: AuditLog) => void;
}

export function AuditLogsTable({ logs, isLoading, onInspect }: AuditLogsTableProps) {
  const columns: Column<AuditLog>[] = [
    {
      header: "Timestamp",
      cell: (l) => (
        <span className="text-slate-300 font-mono text-[11px]">
          {new Date(l.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Module",
      cell: (l) => (
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          {l.module}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (l) => <StatusBadge status={l.action} />,
    },
    {
      header: "Entity",
      cell: (l) => <span className="text-slate-300 font-mono text-[11px]">{l.entity}</span>,
    },
    {
      header: "Actor ID / IP",
      cell: (l) => (
        <div className="text-slate-400 font-mono text-[11px]">
          <div>{l.user_id ? `${l.user_id.slice(0, 8)}...` : "System"}</div>
          <div className="text-[10px] text-slate-500">{l.ip_address || "127.0.0.1"}</div>
        </div>
      ),
    },
    {
      header: "Payload",
      align: "right",
      cell: (l) => (
        <button
          onClick={() => onInspect(l)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      keyExtractor={(l) => l.id}
      isLoading={isLoading}
      loadingMessage="Loading immutable audit trail..."
      emptyState={{
        icon: ScrollText,
        title: "No audit logs recorded",
        description: "Actions performed across the workspace will appear here.",
      }}
    />
  );
}
