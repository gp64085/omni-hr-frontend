import { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30",
        gradient:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25",
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
        outline: "bg-transparent hover:bg-slate-800/50 text-slate-300 border border-slate-700",
        ghost: "hover:bg-slate-800/60 text-slate-300 hover:text-white",
        danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30",
        destructive: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30",
        link: "text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "py-3 px-4 text-sm gap-2",
        xs: "py-1 px-2 text-xs gap-1 rounded-lg",
        sm: "py-1.5 px-3 text-xs gap-1.5 rounded-lg",
        lg: "py-3.5 px-5 text-base gap-2.5 rounded-xl",
        icon: "size-8 p-0",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "gradient",
  size = "default",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
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

export { buttonVariants };
