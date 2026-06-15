"use client";

import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
};

export function InputPassword({
  label,
  placeholder,
  register,
  error,
  disabled,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-center">{label}</label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          className="text-center w-full px-12 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 uppercase font-mono tracking-[0.3em]"
          {...register}
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {show ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
