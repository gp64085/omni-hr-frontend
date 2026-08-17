"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MONTH_NAMES, WEEK_DAYS_MINI } from "@/constants";

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  required = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month and year navigation state
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

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

  const handleOpenToggle = () => {
    if (disabled) return;
    if (!isOpen && value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
    setIsOpen(!isOpen);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const selected = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(selected);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const monthStr = String(today.getMonth() + 1).padStart(2, "0");
    const dayStr = String(today.getDate()).padStart(2, "0");
    onChange(`${today.getFullYear()}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  // Monday as start of week: 0 = Mon, ..., 6 = Sun
  const startOffset = (firstDayOfWeek + 6) % 7;

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const d = new Date(val + "T00:00:00");
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={clsx("relative space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div
        onClick={handleOpenToggle}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-slate-900 text-sm cursor-pointer transition-all select-none",
          isOpen
            ? "border-indigo-500 ring-1 ring-indigo-500 text-white"
            : "border-slate-800 text-slate-200 hover:border-slate-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className={value ? "text-white font-medium" : "text-slate-500"}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95">
          {/* Header Month / Year Navigator */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-xs text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {WEEK_DAYS_MINI.map((wd) => (
              <span key={wd} className="text-[10px] font-semibold text-slate-500">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const monthStr = String(viewMonth + 1).padStart(2, "0");
              const dayStr = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

              const isSelected = value === dateStr;
              const todayStr = new Date().toISOString().split("T")[0];
              const isToday = dateStr === todayStr;

              const isPastMin = minDate && dateStr < minDate;
              const isPastMax = maxDate && dateStr > maxDate;
              const isDisabled = isPastMin || isPastMax;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!!isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={clsx(
                    "h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40"
                      : isToday
                        ? "border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white",
                    isDisabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
