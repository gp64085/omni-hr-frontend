"use client";

import React from "react";
import { Project } from "../types/project-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FolderKanban, Calendar, Edit2 } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { PERMISSIONS } from "@/constants";

interface ProjectsGridProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
}

export function ProjectsGrid({ projects, isLoading, onEdit }: ProjectsGridProps) {
  const { hasPermission } = useAuthStore();
  const canWrite = hasPermission(PERMISSIONS.PROJECTS_WRITE);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-white">No active projects found</h4>
        <p className="text-xs text-slate-400 mt-1">
          Create a new project to start tracking billable work.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <div
          key={p.id}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-sm transition-all flex flex-col justify-between space-y-4 group"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{p.name}</h4>
                  <span className="font-mono text-[10px] text-slate-400">{p.code}</span>
                </div>
              </div>

              <StatusBadge status={p.status || "active"} />
            </div>

            <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
              {p.description || "No project description provided."}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{p.start_date || "Continuous"}</span>
            </div>

            {canWrite && (
              <button
                onClick={() => onEdit(p)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Edit Project"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
