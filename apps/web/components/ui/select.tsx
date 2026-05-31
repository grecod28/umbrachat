"use client";

import { useState } from "react";
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-center">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
            w-full px-4 py-3
            rounded-xl bg-surface border border-border
            flex items-center justify-center
            hover:border-primary/60
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            transition-all
            relative
          "
        >
          {/* Texto Centrado */}
          <span className="text-center">{selected?.label}</span>

          {/* Icono posicionado a la derecha para no mover el texto */}
          <IoChevronDown
            className={`absolute right-4 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />

            <div
              className="
                absolute mt-2 w-full z-50
                rounded-xl border border-border
                bg-surface/95 backdrop-blur-md
                shadow-[0_10px_40px_rgba(0,0,0,0.4)]
                overflow-hidden
                animate-fade-in
                text-base
              "
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="
                    w-full px-4 py-3
                    flex items-center justify-center
                    hover:bg-surface-light
                    transition-colors
                    relative
                  "
                >
                  <span className="text-center">{option.label}</span>

                  {value === option.value && (
                    <IoCheckmark
                      className="absolute right-4 text-primary"
                      size={20}
                    />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
