"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PERMISSIONS, ROUTES, ROLES } from "@/constants";
import { DashboardCalendar } from "./DashboardCalendar";
import { useDashboardSummaryQuery } from "../hooks/use-dashboard-queries";

export function DashboardView() {
  const { user, hasPermission } = useAuthStore();
  const { data, isLoading } = useDashboardSummaryQuery();

  const totalRemainingLeaves = (data?.balances || []).reduce(
    (acc, curr) => acc + (curr.remaining_days || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OmniHR Workspace Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.first_name || "Team Member"}!
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {user?.designation?.title || "Team Member"} • {user?.department?.name || "Corporate"}{" "}
              • Role:{" "}
              <span className="text-indigo-300 font-semibold capitalize">
                {user?.role?.name ? user.role.name.replace("_", " ") : ROLES.EMPLOYEE}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.LEAVES}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Apply Leave</span>
            </Link>
            <Link
              href={ROUTES.TIMESHEETS}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Log Hours</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Workforce</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {isLoading
                ? "..."
                : data?.totalEmployees !== null && data?.totalEmployees !== undefined
                  ? data.totalEmployees
                  : "Active"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {data?.totalEmployees !== null && data?.totalEmployees !== undefined
                ? "Registered personnel"
                : user?.department?.name || "Corporate"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Remaining Quota</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {isLoading ? "..." : `${totalRemainingLeaves} Days`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all leave categories</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Hours Logged</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {isLoading ? "..." : `${(data?.weeklyHours || 0).toFixed(1)} hrs`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Current work week</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {hasPermission(PERMISSIONS.LEAVE_APPROVE) ? "Pending Approvals" : "Security Level"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              {hasPermission(PERMISSIONS.LEAVE_APPROVE) ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {isLoading
                ? "..."
                : hasPermission(PERMISSIONS.LEAVE_APPROVE)
                  ? data?.pendingApprovalsCount || 0
                  : "RBAC Active"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {hasPermission(PERMISSIONS.LEAVE_APPROVE)
                ? "Requires your review"
                : "Role-scoped data boundary"}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Month Calendar */}
      <DashboardCalendar />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Leave Quotas & Balances
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocated days for current calendar year
                </p>
              </div>
              <Link
                href={ROUTES.LEAVES}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!data?.balances || data.balances.length === 0) && !isLoading && (
              <div className="text-xs text-slate-500 text-center py-6">
                No leave allocations recorded for this year.
              </div>
            )}

            <div className="space-y-4">
              {(data?.balances || []).map((allocation) => {
                const total = allocation.allocated_days || 1;
                const used = allocation.used_days || 0;
                const remaining = allocation.remaining_days || 0;
                const percentUsed = Math.min(100, Math.round((used / total) * 100));

                return (
                  <div key={allocation.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 capitalize">
                        {allocation.leave_type?.name || "Leave"}
                      </span>
                      <span className="text-slate-400">
                        <strong className="text-white">{remaining}</strong> / {total} days remaining
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href={ROUTES.LEAVES}
                className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Leave Portal</span>
              </Link>

              <Link
                href={ROUTES.TIMESHEETS}
                className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Timesheets</span>
              </Link>

              {hasPermission(PERMISSIONS.USERS_READ) && (
                <Link
                  href={ROUTES.EMPLOYEES}
                  className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Directory</span>
                </Link>
              )}

              {hasPermission(PERMISSIONS.ROLES_READ) && (
                <Link
                  href={ROUTES.ROLES}
                  className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">RBAC Roles</span>
                </Link>
              )}

              <Link
                href={ROUTES.PROFILE}
                className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Upcoming Holidays</h3>
                <p className="text-xs text-slate-400 mt-0.5">Official corporate holidays</p>
              </div>
              <CalendarDays className="w-5 h-5 text-indigo-400" />
            </div>

            {(!data?.upcomingHolidays || data.upcomingHolidays.length === 0) && !isLoading ? (
              <div className="text-xs text-slate-500 text-center py-6">
                No upcoming holidays scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {(data?.upcomingHolidays || []).map((holiday) => (
                  <div
                    key={holiday.id}
                    className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{holiday.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(holiday.holiday_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <StatusBadge status="Official" variant="system" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
