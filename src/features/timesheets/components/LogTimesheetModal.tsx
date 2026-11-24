"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import {
  TimesheetEntry,
  TimesheetEntryCreatePayload,
  TimesheetEntryUpdatePayload,
} from "../types/timesheet-types";
import { LogTimesheetForm } from "../forms/LogTimesheetForm";

interface LogTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TimesheetEntryCreatePayload) => Promise<void>;
  onUpdate?: (id: string, payload: TimesheetEntryUpdatePayload) => Promise<void>;
  isLoading: boolean;
  defaultWorkDate?: string;
  existingEntries?: TimesheetEntry[];
  editingEntry?: TimesheetEntry | null;
}

export function LogTimesheetModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  defaultWorkDate,
  existingEntries = [],
  editingEntry = null,
}: LogTimesheetModalProps) {
  if (!isOpen) return null;

  const isRejectedMode = editingEntry?.status === "rejected";
  const isEditMode = Boolean(editingEntry);

  const modalTitle = isRejectedMode
    ? "Resubmit Rejected Timesheet"
    : isEditMode
      ? "Edit Timesheet Entry"
      : "Log Timesheet";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="3xl">
      <LogTimesheetForm
        key={`${editingEntry?.id || "new"}-${defaultWorkDate || "default"}`}
        onClose={onClose}
        onSubmit={onSubmit}
        onUpdate={onUpdate}
        isLoading={isLoading}
        defaultWorkDate={defaultWorkDate}
        existingEntries={existingEntries}
        editingEntry={editingEntry}
      />
    </Modal>
  );
}
