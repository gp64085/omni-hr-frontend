import { ReactNode, ElementType } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlertProps {
  variant?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<
  "error" | "success" | "info",
  { container: string; icon: ElementType }
> = {
  error: {
    container: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    icon: AlertCircle,
  },
  success: {
    container: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
  },
  info: {
    container: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    icon: Info,
  },
};

export function Alert({ variant = "error", children, className = "" }: AlertProps) {
  const config = variantStyles[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${config.container} ${className}`}
    >
      <IconComponent className="w-5 h-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
