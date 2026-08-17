"use client";

import React from "react";
import clsx from "clsx";
import { FolderOpen } from "lucide-react";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export interface EmptyStateConfig {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyState?: EmptyStateConfig;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingMessage = "Loading records...",
  emptyState,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">{loadingMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    const EmptyIcon = emptyState?.icon || FolderOpen;
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <EmptyIcon className="w-10 h-10 text-slate-600 mx-auto" />
        <div>
          <h4 className="text-sm font-bold text-white">
            {emptyState?.title || "No records found"}
          </h4>
          {emptyState?.description && (
            <p className="text-xs text-slate-400 mt-1">{emptyState.description}</p>
          )}
        </div>
        {emptyState?.action && <div className="pt-2">{emptyState.action}</div>}
      </div>
    );
  }

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm",
        className
      )}
    >
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={clsx("px-6 py-4", alignStyles[col.align || "left"], col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.map((item, rowIdx) => (
            <tr
              key={keyExtractor(item, rowIdx)}
              className="hover:bg-slate-800/30 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={clsx("px-6 py-4", alignStyles[col.align || "left"], col.className)}
                >
                  {col.cell
                    ? col.cell(item, rowIdx)
                    : col.accessorKey
                      ? String(item[col.accessorKey] ?? "—")
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
