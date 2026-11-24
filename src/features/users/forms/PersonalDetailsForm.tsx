"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Phone, Save } from "lucide-react";
import { ProfileUpdatePayload } from "@/features/users/types/user-types";
import { UserProfileData } from "@/types/user";

export interface PersonalDetailsFormProps {
  initialData?: UserProfileData | ProfileUpdatePayload | null;
  onSave: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading: boolean;
}

export function PersonalDetailsForm({ initialData, onSave, isLoading }: PersonalDetailsFormProps) {
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
