import type { ReactNode } from "react";

interface ChipProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Chip({
  active = false,
  children,
  className = "",
}: ChipProps) {
  return (
    <span
      data-active={active}
      className={`chip whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
