"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Clock, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { formatMinutesToHHMM, parseTimeToMinutes } from "@/lib/date-utils";

export interface TimePickerProps {
  label?: string;
  value: number | string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const PRESET_MINUTES = [
  { label: "15m", mins: 15 },
  { label: "30m", mins: 30 },
  { label: "45m", mins: 45 },
  { label: "1h", mins: 60 },
  { label: "2h", mins: 120 },
  { label: "3h", mins: 180 },
  { label: "4h", mins: 240 },
  { label: "6h", mins: 360 },
  { label: "8h", mins: 480 },
];

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
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState("");

  // Convert incoming value (HH:mm string or decimal hours) to total minutes
  const currentTotalMinutes =
    typeof value === "string" && value.includes(":")
      ? parseTimeToMinutes(value)
      : Math.max(0, Math.min(24 * 60, Math.round((parseFloat(String(value)) || 0) * 60)));

  const displayFormatted = formatMinutesToHHMM(currentTotalMinutes);
  const displayValue = isFocused ? inputText : displayFormatted;

  const commitMinutes = (mins: number) => {
    const clampedMins = Math.max(0, Math.min(24 * 60, Math.round(mins)));
    const formattedHHMM = formatMinutesToHHMM(clampedMins);
    onChange(formattedHHMM);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputText(displayFormatted);
    e.target.select();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9:hmHM ]/g, "");
    setInputText(filtered);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (!inputText.trim()) {
      commitMinutes(0);
      return;
    }
    const parsedMins = parseTimeToMinutes(inputText);
    commitMinutes(parsedMins);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parsedMins = parseTimeToMinutes(inputText);
      commitMinutes(parsedMins);
      setIsFocused(false);
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const current = parseTimeToMinutes(inputText || displayFormatted);
      const next = current + 15;
      commitMinutes(next);
      setInputText(formatMinutesToHHMM(next));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const current = parseTimeToMinutes(inputText || displayFormatted);
      const next = Math.max(0, current - 15);
      commitMinutes(next);
      setInputText(formatMinutesToHHMM(next));
    }
  };

  const currentHours = Math.floor(currentTotalMinutes / 60);
  const currentMinutes = currentTotalMinutes % 60;

  return (
    <div className={clsx("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div
        className={clsx(
          "w-full flex items-center rounded-xl border transition-all duration-150 relative bg-slate-900/80",
          disabled
            ? "border-slate-800 text-slate-600 bg-slate-900/40 cursor-not-allowed"
            : isFocused
              ? "border-indigo-500 ring-2 ring-indigo-500/20 text-slate-100"
              : "border-slate-800 hover:border-slate-700 text-slate-200"
        )}
      >
        <div className="pl-3 text-indigo-400 shrink-0 pointer-events-none">
          <Clock className="w-4 h-4" />
        </div>

        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent px-2.5 py-2 font-mono text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />

        {/* Popover trigger for quick selection */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            disabled={disabled}
            className={clsx(
              "pr-2.5 pl-1.5 py-2 text-slate-400 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer",
              disabled && "cursor-not-allowed opacity-50"
            )}
            title="Quick Time Presets"
          >
            <ChevronDown
              className={clsx(
                "w-3.5 h-3.5 transition-transform duration-200",
                open && "rotate-180 text-indigo-400"
              )}
            />
          </PopoverTrigger>

          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-64 p-3.5 bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl z-50 text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Duration (24:00)
              </span>
              <div className="px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                {displayFormatted}
              </div>
            </div>

            {/* Hours & Minutes Stepper Controls */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Hours ({currentHours}h)
                </span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      commitMinutes(Math.max(0, (currentHours - 1) * 60 + currentMinutes))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-7">{currentHours}</span>
                  <button
                    type="button"
                    onClick={() =>
                      commitMinutes(Math.min(24 * 60, (currentHours + 1) * 60 + currentMinutes))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Mins ({currentMinutes}m)
                </span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      commitMinutes(Math.max(0, currentHours * 60 + currentMinutes - 15))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-7">{currentMinutes}</span>
                  <button
                    type="button"
                    onClick={() =>
                      commitMinutes(Math.min(24 * 60, currentHours * 60 + currentMinutes + 15))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESET_MINUTES.map((p) => {
                  const isSelected = currentTotalMinutes === p.mins;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        commitMinutes(p.mins);
                        setOpen(false);
                      }}
                      className={clsx(
                        "px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
