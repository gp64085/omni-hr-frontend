"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authApi } from "@/features/auth/api/auth-api";
import { getApiErrorMessage } from "@/lib/error-utils";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
        <Card>
          <div className="space-y-6 text-center py-2">
            <Alert variant="error">
              Invalid or missing reset token. Please request a new password reset link.
            </Alert>
            <Link href="/forgot-password" className="block w-full">
              <Button variant="gradient" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token,
        new_password: newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(err) || "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Link>

      <Card>
        <div className="border-b border-slate-800 pb-4 mb-6 text-center">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create New Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a strong password to protect your corporate OmniHR account.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 text-center py-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Password reset complete</p>
                <p className="text-xs text-slate-300">
                  Your password has been securely updated and all prior active sessions have been signed out.
                </p>
              </div>
            </div>

            <Link href="/login" className="block w-full pt-2">
              <Button variant="gradient" className="w-full">
                Sign In with New Password
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <Alert variant="error" className="mb-4">
                {errorMsg}
              </Alert>
            )}

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••••••"
              required
              minLength={8}
              autoFocus
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••••••"
              required
              minLength={8}
            />

            <p className="text-[11px] text-slate-400">
              Must be at least 8 characters long.
            </p>

            <Button
              type="submit"
              variant="gradient"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Need assistance?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Return to login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
