"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { CreateHolidayForm } from "../forms/CreateHolidayForm";

export interface CreateHolidayModalProps {
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Holiday">
      <CreateHolidayForm onClose={onClose} onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
