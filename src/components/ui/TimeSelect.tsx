"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Clock, ChevronDown } from "lucide-react";
import { TIMESHEET_CONSTANTS, TIME_PRESET_HOURS } from "@/constants";

interface TimeSelectProps {
  label?: string;
  value: number | string; // hours as number or string
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TimeSelect({
  label,
  value,
  onChange,
  min = TIMESHEET_CONSTANTS.MIN_ENTRY_HOURS,
  max = TIMESHEET_CONSTANTS.MAX_ENTRY_HOURS,
  step = TIMESHEET_CONSTANTS.HOURS_STEP,
  required = false,
  disabled = false,
  className,
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const numVal = parseFloat(String(value)) || 0;

  // Generate options from min to max by step
  const options: number[] = [];
  for (let h = min; h <= max; h += step) {
    options.push(parseFloat(h.toFixed(1)));
  }

  return (
    <div className={clsx("relative space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-slate-900 text-sm cursor-pointer transition-all select-none",
          isOpen
            ? "border-indigo-500 ring-1 ring-indigo-500 text-white"
            : "border-slate-800 text-slate-200 hover:border-slate-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-white font-medium">
            {numVal > 0 ? `${numVal.toFixed(1)} Hours` : "Select Hours"}
          </span>
        </div>

        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 transition-transform",
            isOpen && "rotate-180 text-indigo-400"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95">
          {/* Quick hour presets */}
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Presets
            </span>
            <div className="grid grid-cols-5 gap-1">
              {TIME_PRESET_HOURS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange(String(preset));
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    numVal === preset
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

          {/* Full List */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              All Increments
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(String(opt));
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer text-left",
                    numVal === opt
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <span>{opt.toFixed(1)} Hours</span>
                  {opt === 8.0 && (
                    <span className="text-[10px] text-slate-500 uppercase">Full Day</span>
                  )}
                  {opt === 4.0 && (
                    <span className="text-[10px] text-slate-500 uppercase">Half Day</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
