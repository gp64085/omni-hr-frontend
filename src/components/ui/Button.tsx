import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "gradient" | "primary" | "secondary" | "outline" | "danger";
  isLoading?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  gradient:
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25",
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30",
  secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
  outline: "bg-transparent hover:bg-slate-800/50 text-slate-300 border border-slate-700",
  danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30",
};

export function Button({
  children,
  variant = "gradient",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
