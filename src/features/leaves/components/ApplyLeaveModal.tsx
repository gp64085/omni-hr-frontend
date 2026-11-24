"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { LeaveRequestCreatePayload } from "../types/leave-types";
import { ApplyLeaveForm } from "../forms/ApplyLeaveForm";

export interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: LeaveRequestCreatePayload) => Promise<void>;
  isLoading: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function ApplyLeaveModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultStartDate,
  defaultEndDate,
}: ApplyLeaveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Leave">
      <ApplyLeaveForm
        onClose={onClose}
        onSubmit={onSubmit}
        isLoading={isLoading}
        defaultStartDate={defaultStartDate}
        defaultEndDate={defaultEndDate}
      />
    </Modal>
  );
}
