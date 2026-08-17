"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { AuditLog } from "../types/audit-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Globe, User } from "lucide-react";

interface AuditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export function AuditDetailsModal({ isOpen, onClose, log }: AuditDetailsModalProps) {
  if (!log) return null;

  let formattedPayload = "{}";
  try {
    formattedPayload = JSON.stringify(log.details || {}, null, 2);
  } catch {
    formattedPayload = String(log.details);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Inspection"
      description={`Immutable compliance and audit trail record (${log.id})`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Module</span>
            <span className="font-bold text-white uppercase">{log.module}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Action</span>
            <div className="mt-0.5">
              <StatusBadge status={log.action} />
            </div>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Entity</span>
            <span className="font-mono text-slate-300 truncate block">{log.entity}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Timestamp
            </span>
            <span className="text-slate-300 font-mono text-[11px] block">
              {new Date(log.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Client & Actor context */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Actor:{" "}
              <strong className="text-white font-mono">{log.user_id || "System Action"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-slate-500 shrink-0" />
            <span>IP: {log.ip_address || "127.0.0.1"}</span>
          </div>
        </div>

        {/* Payload JSON Inspector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Captured Request / Change Details
          </label>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto max-h-64">
            {formattedPayload}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
