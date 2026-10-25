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
    setOpen((previous) => {
      const next = !previous;
      onOpenChange?.(next);
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", onPointer as unknown as EventListener);
    document.addEventListener("touchstart", onPointer as unknown as EventListener);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener(
        "mousedown",
        onPointer as unknown as EventListener,
      );
      document.removeEventListener(
        "touchstart",
        onPointer as unknown as EventListener,
      );
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const alignClass = align === "left" ? "left-0" : "right-0";
  const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-1.5";

  return (
    <div ref={ref} className="relative">
      <div onClick={toggle} className="cursor-pointer">
        {typeof trigger === "function" ? trigger(open) : trigger}
      </div>

      {open && (
        <div
          role="menu"
          className={`panel absolute z-[70] max-h-[min(70vh,24rem)] w-56 overflow-y-auto p-1 shadow-lift ${alignClass} ${sideClass} ${className}`}
          onClick={() => {
            setOpen(false);
            onOpenChange?.(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
