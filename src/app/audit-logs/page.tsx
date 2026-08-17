"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuditLogsTable } from "@/features/audit/components/AuditLogsTable";
import { AuditDetailsModal } from "@/features/audit/components/AuditDetailsModal";
import { FilterBar } from "@/components/ui/FilterBar";
import { auditApi } from "@/features/audit/api/audit-api";
import { AuditLog } from "@/features/audit/types/audit-types";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { PAGINATION, SYSTEM_MODULES } from "@/constants";

export default function AuditLogsPage() {
  const { error } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        const res = await auditApi.listLogs({
          page,
          limit: PAGINATION.DEFAULT_LIMIT,
          module: selectedModule !== "all" ? selectedModule : undefined,
        });
        if (isMounted && res.data) {
          setLogs(res.data);
          setTotal(res.meta?.total || res.data.length);
        }
      } catch (err) {
        if (isMounted) {
          error("Failed to load audit logs", getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [page, selectedModule, error]);

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
                  setIsLoading(true);
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
