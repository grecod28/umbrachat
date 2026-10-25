"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";
import { UseFormRegisterReturn } from "react-hook-form";

type Option = {
  readonly label: string;
  readonly value: string;
};

type Props = {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  register?: UseFormRegisterReturn;
};

export function Select({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-listbox`;

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="space-y-2">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className="field flex items-center justify-between gap-3 text-left"
        >
          <span className="truncate">{selected?.label}</span>
          <IoChevronDown
            size={16}
            className={`shrink-0 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className="panel absolute z-[70] mt-2 max-h-64 w-full overflow-y-auto p-1 shadow-lift"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-accent/10 text-accent"
                    : "text-text hover:bg-surface-2"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <IoCheckmark size={16} className="shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
