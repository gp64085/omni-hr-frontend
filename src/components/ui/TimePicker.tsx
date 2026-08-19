"use client";

import React, { useState, useRef } from "react";
import clsx from "clsx";
import { Clock, ChevronDown } from "lucide-react";
import { formatMinutesToHHMM } from "@/lib/date-utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export interface TimePickerProps {
  label?: string;
  value: number | string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function TimePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  placeholder = "00:00",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);

  const numVal = parseFloat(String(value)) || 0;
  const currentTotalMinutes = Math.max(0, Math.min(24 * 60, Math.round(numVal * 60)));

  const currentHours = Math.floor(currentTotalMinutes / 60);
  const currentMinutes = currentTotalMinutes % 60;

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  const commitTime = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(24, h));
    const clampedM = Math.max(0, Math.min(59, m));
    const totalMins = clampedH * 60 + clampedM;
    const decimalHours = Number((totalMins / 60).toFixed(2));
    onChange(String(decimalHours));
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      commitTime(currentHours + 1, currentMinutes);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      commitTime(currentHours - 1, currentMinutes);
    } else if (e.key === "ArrowRight" || e.key === ":") {
      e.preventDefault();
      minutesRef.current?.focus();
      minutesRef.current?.select();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      commitTime(currentHours, currentMinutes + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      commitTime(currentHours, currentMinutes - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      hoursRef.current?.focus();
      hoursRef.current?.select();
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      commitTime(parsed, currentMinutes);
      if (val.length === 2 || parsed > 2) {
        minutesRef.current?.focus();
        minutesRef.current?.select();
      }
    } else if (val === "") {
      commitTime(0, currentMinutes);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      commitTime(currentHours, parsed);
    } else if (val === "") {
      commitTime(currentHours, 0);
    }
  };

  const formattedDisplay =
    currentTotalMinutes > 0 ? formatMinutesToHHMM(currentTotalMinutes) : placeholder;

  return (
    <div className={clsx("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className={clsx(
            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-150 cursor-pointer select-none text-left",
            disabled
              ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
              : open
                ? "bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-100"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span
              className={clsx(
                "font-mono font-medium text-xs sm:text-sm",
                currentTotalMinutes > 0 ? "text-slate-100" : "text-slate-500"
              )}
            >
              {formattedDisplay}
            </span>
          </div>

          <ChevronDown
            className={clsx(
              "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
              open && "rotate-180 text-indigo-400"
            )}
          />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-60 p-3.5 bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl z-50 text-slate-100 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time
            </span>
            <div className="px-2 py-0.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
              {formatMinutesToHHMM(currentTotalMinutes)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Hours</span>
              <input
                ref={hoursRef}
                type="text"
                inputMode="numeric"
                value={String(currentHours).padStart(2, "0")}
                onChange={handleHoursChange}
                onKeyDown={handleHoursKeyDown}
                onFocus={(e) => e.target.select()}
                className="w-12 h-9 text-center bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                maxLength={2}
              />
            </div>

            <span className="text-slate-400 font-mono text-lg font-bold mt-4">:</span>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Minutes
              </span>
              <input
                ref={minutesRef}
                type="text"
                inputMode="numeric"
                value={String(currentMinutes).padStart(2, "0")}
                onChange={handleMinutesChange}
                onKeyDown={handleMinutesKeyDown}
                onFocus={(e) => e.target.select()}
                className="w-12 h-9 text-center bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                maxLength={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
