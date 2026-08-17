"use client";

import React, { useEffect, useState } from "react";
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
  Cpu,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/use-auth-store";
import { authApi } from "@/features/auth/api/auth-api";
import { ROUTES, PERMISSIONS, STORAGE_KEYS, ROLES, PermissionCode } from "@/constants";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
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
  const { user, accessToken, logout, hasPermission, setAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || "";

      if (!storedToken) {
        router.push(ROUTES.LOGIN);
        return;
      }

      if (!user && storedToken) {
        try {
          const res = await authApi.getMe(storedToken);
          if (res.data) {
            setAuth(res.data, storedToken, storedRefresh);
          }
        } catch {
          logout();
          router.push(ROUTES.LOGIN);
        }
      }
      setIsHydrating(false);
    };

    initAuth();
  }, [user, router, setAuth, logout]);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0D14] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">
            Authenticating OmniHR workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!user && !accessToken) {
    return null;
  }

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

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || "";
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore
    } finally {
      logout();
      router.push(ROUTES.LOGIN);
    }
  };

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
              {user?.first_name?.[0] || "U"}
              {user?.last_name?.[0] || ""}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-[10px] text-indigo-400 capitalize truncate">
                {user?.role?.name ? user.role.name.replace("_", " ") : ROLES.EMPLOYEE}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-18 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {title || "Dashboard"}
              </h1>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium capitalize">
                {user?.role?.name ? user.role.name.replace("_", " ") : ROLES.EMPLOYEE}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
}
