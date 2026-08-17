"use client";

import React, { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}
      <select
        className={clsx(
          "w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 rounded-xl px-3 py-2.5 outline-none transition-all cursor-pointer",
          error && "border-rose-500 focus:border-rose-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
