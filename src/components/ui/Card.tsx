import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800/90 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative ${className}`}
    >
      {children}
    </div>
  );
}
