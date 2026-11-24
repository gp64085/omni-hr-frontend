"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authApi } from "@/features/auth/api/auth-api";
import { getApiErrorMessage } from "@/lib/error-utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(err) || "Failed to process password reset. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
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
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Forgot Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your corporate email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="error" className="mb-6">
              {errorMsg}
            </Alert>
          )}

          {isSubmitted ? (
            <div className="space-y-6 text-center py-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Reset instructions sent</p>
                  <p className="text-xs text-slate-300">
                    If an account exists for <span className="text-white font-medium">{email}</span>, you will receive an email shortly with a secure password reset link.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Please check your inbox as well as your spam/junk folder. The reset link expires in 15 minutes.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Send to a different email
                </Button>
                <Link href="/login" className="w-full">
                  <Button variant="gradient" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Corporate Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                placeholder="you@company.com"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="gradient"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Send Reset Link
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Remember your password?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
