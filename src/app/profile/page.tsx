"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuthStore } from "@/store/use-auth-store";
import { User, Phone, Building, CreditCard, FileText, ShieldCheck, Save } from "lucide-react";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
} from "@/features/users/hooks/use-users-queries";
import { ProfileUpdatePayload } from "@/features/users/types/user-types";
import { UserProfileData } from "@/types/user";

interface FormProps {
  initialData?: UserProfileData | ProfileUpdatePayload | null;
  onSave: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

function PersonalDetailsForm({ initialData, onSave, isLoading }: FormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone_number || "");
  const [emergencyContact, setEmergencyContact] = useState(initialData?.emergency_contact || "");
  const [address, setAddress] = useState(initialData?.address || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      phone_number: phoneNumber,
      emergency_contact: emergencyContact,
      address,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Personal Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          icon={Phone}
          placeholder="+1 (555) 019-2834"
        />
        <Input
          label="Emergency Contact (Name & Number)"
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          icon={User}
          placeholder="Parent / Spouse: +1 (555) 019-9999"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Residential Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          placeholder="Street Address, City, Postal Code, Country"
          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button
          type="submit"
          variant="gradient"
          isLoading={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Contact Details</span>
        </Button>
      </div>
    </form>
  );
}

function BankingDetailsForm({ initialData, onSave, isLoading }: FormProps) {
  const [bankName, setBankName] = useState(initialData?.bank_name || "");
  const [bankAccount, setBankAccount] = useState(initialData?.bank_account_number || "");
  const [ifscCode, setIfscCode] = useState(initialData?.ifsc_swift_code || "");
  const [panSsn, setPanSsn] = useState(initialData?.pan_ssn || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bank_name: bankName,
      bank_account_number: bankAccount,
      ifsc_swift_code: ifscCode,
      pan_ssn: panSsn,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Bank Name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          icon={Building}
          placeholder="e.g. JPMorgan Chase / HDFC Bank"
        />
        <Input
          label="Account Number"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          icon={CreditCard}
          placeholder="••••••••••9281"
        />
        <Input
          label="IFSC / SWIFT / Routing Code"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
          icon={FileText}
          placeholder="CHASUS33 / HDFC0001234"
        />
        <Input
          label="PAN / SSN / Tax Identifier"
          value={panSsn}
          onChange={(e) => setPanSsn(e.target.value)}
          icon={ShieldCheck}
          placeholder="ABCDE1234F / XXX-XX-1234"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button
          type="submit"
          variant="gradient"
          isLoading={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Banking Details</span>
        </Button>
      </div>
    </form>
  );
}

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
