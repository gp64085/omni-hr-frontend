"use client";

import { Sparkles, ShieldCheck, Lock } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";

export default function LoginPage() {
  const authForm = useAuthForm();

  return (
    <PageLayout>
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Feature Summary Column */}
        <div className="lg:col-span-7 space-y-8">
          <Badge variant="indigo">
            <Sparkles className="w-3.5 h-3.5" />
            Secure Enterprise Identity & Access Management
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Sign In to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              OmniHR Workspace
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Access your corporate HR portal to manage leave applications, submit weekly timesheets,
            inspect payslips, and execute AI workforce tools.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Admin-Provisioned Accounts</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Strict security policies require HR/Admin activation before login.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">JWT Token Rotation</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Single-use refresh token rotation with SHA-256 database hashing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Container */}
        <div className="lg:col-span-5">
          <AuthCard
            email={authForm.email}
            setEmail={authForm.setEmail}
            password={authForm.password}
            setPassword={authForm.setPassword}
            isLoading={authForm.isLoading}
            errorMsg={authForm.errorMsg}
            onSubmit={authForm.handleSubmit}
          />
        </div>
      </div>
    </PageLayout>
  );
}
