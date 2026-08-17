"use client";

import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { LoginForm } from "./LoginForm";
import { ShieldCheck } from "lucide-react";

interface AuthCardProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
  errorMsg: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthCard({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  errorMsg,
  onSubmit,
}: AuthCardProps) {
  return (
    <Card>
      <div className="border-b border-slate-800 pb-4 mb-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Sign In</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your corporate credentials to access your OmniHR workspace.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="error" className="mb-6">
          {errorMsg}
        </Alert>
      )}

      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-500">
          Need an account or password reset? Please contact your organization&apos;s HR
          administrator.
        </p>
      </div>
    </Card>
  );
}
