"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuthStore } from "@/store/use-auth-store";
import { usersApi } from "@/features/users/api/users-api";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/error-utils";
import { User, Phone, Building, CreditCard, FileText, ShieldCheck, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"personal" | "banking">("personal");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [panSsn, setPanSsn] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    usersApi.getProfile().then((res) => {
      if (isMounted && res.data) {
        setPhoneNumber(res.data.phone_number || "");
        setEmergencyContact(res.data.emergency_contact || "");
        setAddress(res.data.address || "");
        setBankAccount(res.data.bank_account_number || "");
        setBankName(res.data.bank_name || "");
        setIfscCode(res.data.ifsc_swift_code || "");
        setPanSsn(res.data.pan_ssn || "");
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await usersApi.updateProfile({
        phone_number: phoneNumber,
        emergency_contact: emergencyContact,
        address,
        bank_account_number: bankAccount,
        bank_name: bankName,
        ifsc_swift_code: ifscCode,
        pan_ssn: panSsn,
      });

      if (res.data) {
        updateUser({
          profile: res.data,
        });
      }
      success("Profile Saved", "Your self-service record has been updated successfully.");
    } catch (err: unknown) {
      error("Update Failed", getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
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
          <form
            onSubmit={handleSaveProfile}
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
              <label className="block text-xs font-semibold text-slate-300">
                Residential Address
              </label>
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
                isLoading={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact Details</span>
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Banking & Statutory */}
        {activeTab === "banking" && (
          <form
            onSubmit={handleSaveProfile}
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
                isLoading={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Banking Details</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
