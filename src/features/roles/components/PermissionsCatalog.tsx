"use client";

import React, { useState, useEffect } from "react";
import { rolesApi } from "../api/roles-api";
import { Permission } from "../types/role-types";
import { SearchInput } from "@/components/ui/SearchInput";
import { Key } from "lucide-react";
import { PAGINATION, SYSTEM_MODULES } from "@/constants";

export function PermissionsCatalog() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await rolesApi.listPermissions({
          limit: PAGINATION.MAX_LIMIT,
          search: search || undefined,
          module: selectedModule !== "all" ? selectedModule : undefined,
        });
        if (isMounted && res.data) {
          setPermissions(res.data);
        }
      } catch (err) {
        console.error("Failed to load permissions catalog", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [search, selectedModule]);

  return (
    <div className="space-y-4">
      {/* Search & Module filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setIsLoading(true);
          }}
          placeholder="Search by code or description..."
          className="w-full sm:w-72"
        />

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {SYSTEM_MODULES.map((m) => (
            <button
              key={m}
              onClick={() => {
                setSelectedModule(m);
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
      </div>

      {isLoading ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading catalog...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400">
          No system permissions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissions.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">{p.code}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 uppercase">
                    {p.module}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
