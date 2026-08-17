"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export default function DashboardPage() {
  return (
    <AppShell
      title="Workspace Overview"
      subtitle="Welcome to your corporate HR and workforce operations portal"
    >
      <DashboardView />
    </AppShell>
  );
}
