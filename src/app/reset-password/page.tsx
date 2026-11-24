"use client";

import { Suspense } from "react";
import { PageLayout } from "@/components/ui/PageLayout";
import { ResetPasswordForm } from "@/features/auth/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-slate-400">
            Loading password recovery details...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PageLayout>
  );
}
