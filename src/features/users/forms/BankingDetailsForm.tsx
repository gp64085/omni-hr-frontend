"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Building, CreditCard, FileText, ShieldCheck, Save } from "lucide-react";
import { ProfileUpdatePayload } from "@/features/users/types/user-types";
import { UserProfileData } from "@/types/user";

export interface BankingDetailsFormProps {
  initialData?: UserProfileData | ProfileUpdatePayload | null;
  onSave: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function BankingDetailsForm({ initialData, onSave, isLoading }: BankingDetailsFormProps) {
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
