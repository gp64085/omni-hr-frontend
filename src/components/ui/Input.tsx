import { InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  className?: string;
}

export function Input({ label, icon: Icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        )}
        <input
          className={`w-full ${Icon ? "pl-10" : "px-3.5"} pr-4 py-2.5 bg-slate-950/80 border ${
            error ? "border-rose-500" : "border-slate-800"
          } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
