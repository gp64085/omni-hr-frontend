"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OmniHR Application Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            An unexpected error occurred while rendering this workspace view. Our diagnostic engine
            has logged the incident.
          </p>
          {error.message && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => reset()} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard">
            <Button variant="gradient" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
