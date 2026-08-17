"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Calendar, Clock, DollarSign } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/use-auth-store";

export default function Home() {
  const { user } = useAuthStore();

  return (
    <PageLayout>
      <div className="flex flex-col justify-center items-center text-center space-y-10">
        <Badge variant="indigo">
          <Sparkles className="w-4 h-4" />
          Enterprise Next-Gen HRMS & Work Operating System
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Modern HR, Automated Payroll, and{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Tool Execution
          </span>
          .
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
          Streamline workforce management with multi-tier leave approval engines, real-time
          timesheets, role-bounded security, and conversational AI tools.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center gap-3 transition-all"
            >
              Open Workspace Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center gap-3 transition-all"
            >
              Sign In to Workspace
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full mt-12 pt-12 border-t border-slate-800/80">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Leave & Accrual Engine</h3>
            <p className="text-sm text-slate-400">
              Multi-tier role approvals, holiday exclusions, LWS/LOP calculations, and carry-forward
              rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Timesheet & Time Tracking</h3>
            <p className="text-sm text-slate-400">
              Daily work status logging, project task tracking, manager approvals, and overtime
              analytics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Payroll</h3>
            <p className="text-sm text-slate-400">
              Prorated salary calculations, tax deductions, automated payslip generation, and bank
              dispatches.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
