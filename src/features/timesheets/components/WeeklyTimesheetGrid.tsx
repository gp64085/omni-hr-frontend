"use client";

import React from "react";
import { TimesheetEntry } from "../types/timesheet-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Clock, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WeeklyTimesheetGridProps {
  entries: TimesheetEntry[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onSubmitWeekly: () => void;
  isSubmitting: boolean;
}

export function WeeklyTimesheetGrid({
  entries,
  isLoading,
  onDelete,
  onSubmitWeekly,
  isSubmitting,
}: WeeklyTimesheetGridProps) {
  const hasDraftEntries = entries.some((e) => e.status === "draft");

  const columns: Column<TimesheetEntry>[] = [
    {
      header: "Date",
      accessorKey: "work_date",
      className: "font-semibold text-white",
    },
    {
      header: "Project",
      cell: (e) => {
        const projectName = e.project_name || e.project?.name || "General Work";
        const projectCode = e.project?.code;
        return (
          <div className="text-slate-200">
            <span className="font-semibold">{projectName}</span>
            {projectCode && (
              <span className="ml-1.5 font-mono text-[10px] text-slate-500">({projectCode})</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Hours",
      cell: (e) => (
        <span className="font-bold text-white">{(e.hours_spent || 0).toFixed(1)} hrs</span>
      ),
    },
    {
      header: "Activity Summary",
      cell: (e) => (
        <span className="text-slate-400 max-w-xs truncate block">{e.activity_summary}</span>
      ),
    },
    {
      header: "Classification",
      cell: (e) => (
        <StatusBadge
          status={e.is_billable ? "Billable" : "Non-billable"}
          variant={e.is_billable ? "billable" : "non_billable"}
        />
      ),
    },
    {
      header: "Status",
      cell: (e) => <StatusBadge status={e.status} />,
    },
    {
      header: "Action",
      align: "right",
      cell: (e) => {
        const isEditable = e.status === "draft";
        return isEditable ? (
          <button
            onClick={() => onDelete(e.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : null;
      },
    },
  ];

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div>
            <h4 className="text-sm font-bold text-white">Logged Work Entries ({entries.length})</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasDraftEntries
                ? "You have draft entries ready to be submitted for manager approval."
                : "All entries have been submitted or processed."}
            </p>
          </div>

          {hasDraftEntries && (
            <Button
              variant="gradient"
              onClick={onSubmitWeekly}
              isLoading={isSubmitting}
              className="flex items-center gap-2 text-xs py-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Weekly Timesheet</span>
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={entries}
        keyExtractor={(e) => e.id}
        isLoading={isLoading}
        loadingMessage="Loading daily work logs..."
        emptyState={{
          icon: Clock,
          title: "No timesheet entries logged this week",
          description: 'Click "Log Daily Work" to add your hours and project tasks.',
        }}
      />
    </div>
  );
}
