"use client";

import { Cpu, LogOut } from "lucide-react";
import { UserProfile } from "@/types/user";

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const roleDisplay = user?.role?.name ? user.role.name.replace("_", " ") : "Employee";

  return (
    <header className="border-b border-slate-800/80 bg-[#0A0D14]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OmniHR
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              Enterprise v1.0
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs text-indigo-400 capitalize">{roleDisplay}</div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-sm font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
