"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuthStore } from "@/store/use-auth-store";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
} from "@/features/users/hooks/use-users-queries";
import { ProfileUpdatePayload } from "@/features/users/types/user-types";
import { PersonalDetailsForm } from "@/features/users/forms/PersonalDetailsForm";
import { BankingDetailsForm } from "@/features/users/forms/BankingDetailsForm";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"personal" | "banking">("personal");

  const { data: profile } = useUserProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const handleSaveProfile = async (data: ProfileUpdatePayload) => {
    await updateProfileMutation.mutateAsync(data);
  };

  return (
    <AppShell
      title="Self-Service Profile"
      subtitle="Manage your personal information, emergency contacts, and banking details"
    >
      <div className="space-y-6">
        {/* Profile Card Summary Header */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-500/20">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge
                  status={user?.role?.name ? user.role.name.replace("_", " ") : "Employee"}
                  variant="custom"
                />
                <StatusBadge
                  status={user?.is_active ? "Active Account" : "Inactive"}
                  variant="active"
                />
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800">
            <div className="text-xs text-slate-400">Department & Designation</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {user?.designation?.title || "Staff"}
            </div>
            <div className="text-xs text-indigo-400">{user?.department?.name || "Corporate"}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "personal"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Personal & Contact
          </button>
          <button
            onClick={() => setActiveTab("banking")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "banking"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Banking & Statutory
          </button>
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === "personal" && (
          <PersonalDetailsForm
            key={profile?.phone_number || "personal-form"}
            initialData={profile}
            onSave={handleSaveProfile}
            isLoading={updateProfileMutation.isPending}
          />
        )}

        {/* Tab 2: Banking & Statutory */}
        {activeTab === "banking" && (
          <BankingDetailsForm
            key={profile?.bank_account_number || "banking-form"}
            initialData={profile}
            onSave={handleSaveProfile}
            isLoading={updateProfileMutation.isPending}
          />
        )}
      </div>
    </AppShell>
  );
}
