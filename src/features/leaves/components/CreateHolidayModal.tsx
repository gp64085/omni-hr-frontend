"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { getTodayDateString } from "@/lib/date-utils";

interface CreateHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    holiday_date: string;
    is_recurring?: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

export function CreateHolidayModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateHolidayModalProps) {
  const [name, setName] = useState("");
  const [holidayDate, setHolidayDate] = useState(getTodayDateString);
  const [isRecurring, setIsRecurring] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      holiday_date: holidayDate,
      is_recurring: isRecurring,
    });
    setName("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Holiday">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Holiday Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Independence Day / New Year's Day"
          required
        />

        <DatePicker
          label="Holiday Date"
          value={holidayDate}
          onChange={(val) => setHolidayDate(val)}
          required
        />

        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="text-indigo-600 focus:ring-indigo-500 rounded"
          />
          <span>Recurs annually on this calendar date</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Add Holiday
          </Button>
        </div>
      </form>
    </Modal>
  );
}
