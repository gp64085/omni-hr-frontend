"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DatePickerProps {
  label?: string;
  value: string;
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
  const [open, setOpen] = useState(false);

  const parsedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  const parsedMin = minDate && isValid(parseISO(minDate)) ? parseISO(minDate) : undefined;
  const parsedMax = maxDate && isValid(parseISO(maxDate)) ? parseISO(maxDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const displayString = parsedDate ? format(parsedDate, "MMM d, yyyy") : "";

  return (
    <div className={clsx("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 tracking-wider">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className={clsx(
            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer border text-left",
            disabled
              ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
              : open
                ? "bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-100"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <span
              className={clsx(
                "truncate font-medium",
                displayString ? "text-slate-100" : "text-slate-500"
              )}
            >
              {displayString || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {value && !disabled && (
              <span
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto p-3 bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl z-50 text-slate-100"
        >
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={handleSelect}
            disabled={(date) => {
              if (parsedMin && date < parsedMin) return true;
              if (parsedMax && date > parsedMax) return true;
              return false;
            }}
            autoFocus
            className="rounded-xl border-0 p-0 text-slate-100"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
