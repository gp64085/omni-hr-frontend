"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  FolderKanban,
  Clock,
  ScrollText,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { ROUTES, PERMISSIONS, PermissionCode, ROLES } from "@/constants";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useCurrentUserQuery, useLogoutMutation } from "@/features/auth/hooks/use-auth-queries";
import clsx from "clsx";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionCode | string;
  roles?: string[];
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, hasPermission } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  // Background profile synchronization
  useCurrentUserQuery();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push(ROUTES.LOGIN);
  };

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Employees",
      href: ROUTES.EMPLOYEES,
      icon: Users,
      permission: PERMISSIONS.USERS_READ,
    },
    {
      label: "Roles & RBAC",
      href: ROUTES.ROLES,
      icon: ShieldCheck,
      permission: PERMISSIONS.ROLES_READ,
    },
    {
      label: "Leaves & Holidays",
      href: ROUTES.LEAVES,
      icon: CalendarDays,
      permission: PERMISSIONS.LEAVE_READ,
    },
    {
      label: "Projects",
      href: ROUTES.PROJECTS,
      icon: FolderKanban,
      permission: PERMISSIONS.PROJECTS_READ,
    },
    {
      label: "Timesheets",
      href: ROUTES.TIMESHEETS,
      icon: Clock,
      permission: PERMISSIONS.TIMESHEET_SUBMIT,
    },
    {
      label: "Audit Logs",
      href: ROUTES.AUDIT_LOGS,
      icon: ScrollText,
      permission: PERMISSIONS.AUDIT_READ,
    },
    {
      label: "My Profile",
      href: ROUTES.PROFILE,
      icon: UserCheck,
    },
  ];

  const filteredNav = navItems.filter((item) => {
    if (!item.permission && !item.roles) return true;
    if (item.permission && hasPermission(item.permission)) return true;
    if (item.roles && user?.role?.name && item.roles.includes(user.role.name)) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shrink-0 sticky top-0 h-screen z-40">
        <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              OmniHR
            </div>
            <div className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
              Enterprise Suite
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Workspace Modules
          </div>
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-indigo-400" : "text-slate-400"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow">
              {user?.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ""}` : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user ? `${user.first_name} ${user.last_name}` : "Workspace Member"}
              </div>
              <div className="text-[10px] text-indigo-400 capitalize truncate">
                {user?.role?.name ? user.role.name.replace("_", " ") : ROLES.EMPLOYEE}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">OmniHR</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {filteredNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-18 border-b border-slate-800/80 bg-[#0A0D14]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-white">
                  {user ? `${user.first_name} ${user.last_name}` : "Workspace Member"}
                </div>
                <div className="text-[10px] text-indigo-400 capitalize">
                  {user?.department?.name ? user.department.name : "OmniHR"}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow">
                {user?.first_name ? user.first_name[0] : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {actions && <div className="flex items-center justify-end gap-3">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
