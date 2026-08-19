"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { leavesApi } from "../api/leaves-api";
import { LeaveAllocation, LeaveRequestCreatePayload } from "../types/leave-types";
import { getTodayDateString } from "@/lib/date-utils";
import { HALF_DAY_SESSIONS } from "@/constants";

interface ApplyLeaveModalProps {
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
  const [startDate, setStartDate] = useState(defaultStartDate || getTodayDateString);
  const [endDate, setEndDate] = useState(defaultEndDate || defaultStartDate || getTodayDateString);
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"first_half" | "second_half">(
    HALF_DAY_SESSIONS.FIRST_HALF
  );
  const [balances, setBalances] = useState<LeaveAllocation[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      leavesApi.getLeaveBalance(new Date().getFullYear()).then((res) => {
        if (isMounted && res.data) {
          setBalances(res.data);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const totalAvailableQuota = balances.reduce(
    (acc, b) => acc + Math.max(0, b.remaining_days - (b.scheduled_future_days || 0)),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      start_date: startDate,
      end_date: isHalfDay ? startDate : endDate,
      reason: reason || undefined,
      is_half_day: isHalfDay,
      half_day_session: isHalfDay ? halfDaySession : undefined,
    });
    setReason("");
    setIsHalfDay(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(val) => {
              setStartDate(val);
              if (isHalfDay || !endDate || endDate < val) {
                setEndDate(val);
              }
            }}
            required
          />

          {!isHalfDay && (
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(val) => setEndDate(val)}
              minDate={startDate}
              required
            />
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => {
                setIsHalfDay(e.target.checked);
                if (e.target.checked) {
                  setEndDate(startDate);
                }
              }}
              className="text-indigo-600 focus:ring-indigo-500 rounded"
            />
            <span>Apply as Half-Day Leave (0.5 Days)</span>
          </label>

          {isHalfDay && (
            <div className="flex items-center gap-4 pl-5 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="session"
                  checked={halfDaySession === HALF_DAY_SESSIONS.FIRST_HALF}
                  onChange={() => setHalfDaySession(HALF_DAY_SESSIONS.FIRST_HALF)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>First Half (Morning)</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="session"
                  checked={halfDaySession === HALF_DAY_SESSIONS.SECOND_HALF}
                  onChange={() => setHalfDaySession(HALF_DAY_SESSIONS.SECOND_HALF)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Second Half (Afternoon)</span>
              </label>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Reason / Purpose</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Brief explanation for leave request..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2 outline-none transition-all resize-none"
          />
        </div>

        {balances.length > 0 && (
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs flex items-center justify-between">
            <span className="text-slate-400">Total Available Leave Balance</span>
            <span className="font-semibold text-white">{totalAvailableQuota.toFixed(1)} days</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
