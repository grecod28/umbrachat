import type { ReactNode } from "react";

interface ChipProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Chip({ active = false, children, className = "" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-surface border border-border text-text-muted hover:text-text hover:border-primary/40"
      } ${className}`}
    >
      {children}
    </span>
  );
}
