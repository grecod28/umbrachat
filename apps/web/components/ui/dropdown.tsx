"use client";

import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
  type TouchEvent,
} from "react";

interface DropdownProps {
  trigger: ReactNode | ((open: boolean) => ReactNode);
  children: ReactNode;
  align?: "left" | "right";
  side?: "bottom" | "top";
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  side = "bottom",
  className = "",
  onOpenChange,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler as unknown as EventListener);
    document.addEventListener("touchstart", handler as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handler as unknown as EventListener);
      document.removeEventListener("touchstart", handler as unknown as EventListener);
    };
  }, [open]);

  const alignClass = align === "left" ? "left-0" : "right-0";
  const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-1";

  return (
    <div ref={ref} className="relative">
      <div onClick={toggle} className="cursor-pointer">
        {typeof trigger === "function" ? trigger(open) : trigger}
      </div>

      {open && (
        <div
          className={`absolute z-50 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-in ${alignClass} ${sideClass} ${className}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
