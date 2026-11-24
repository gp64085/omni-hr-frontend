"use client";

import { PageLayout } from "@/components/ui/PageLayout";
import { ForgotPasswordForm } from "@/features/auth/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <PageLayout>
      <ForgotPasswordForm />
    </PageLayout>
  );
}
