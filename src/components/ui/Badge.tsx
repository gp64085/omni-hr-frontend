import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "indigo" | "emerald" | "rose" | "purple" | "amber";
  className?: string;
}

const variantStyles: Record<string, string> = {
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export function Badge({ children, variant = "indigo", className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
