"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuditLogsTable } from "@/features/audit/components/AuditLogsTable";
import { AuditDetailsModal } from "@/features/audit/components/AuditDetailsModal";
import { FilterBar } from "@/components/ui/FilterBar";
import { AuditLog } from "@/features/audit/types/audit-types";
import { PAGINATION, SYSTEM_MODULES } from "@/constants";
import { useAuditLogsQuery } from "@/features/audit/hooks/use-audit-queries";

export default function AuditLogsPage() {
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logsData, isLoading } = useAuditLogsQuery({
    page,
    limit: PAGINATION.DEFAULT_LIMIT,
    module: selectedModule !== "all" ? selectedModule : undefined,
  });

  const logs = logsData?.data || [];
  const total = logsData?.meta?.total || logs.length;

  return (
    <AppShell
      title="System Audit Trail"
      subtitle="Immutable event logs capturing administrative changes, approvals, and security events"
    >
      <div className="space-y-6">
        <FilterBar>
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {SYSTEM_MODULES.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedModule(m);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedModule === m
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Total recorded events: <strong className="text-white">{total}</strong>
          </div>
        </FilterBar>

        <AuditLogsTable logs={logs} isLoading={isLoading} onInspect={setSelectedLog} />

        <AuditDetailsModal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      </div>
    </AppShell>
  );
}
