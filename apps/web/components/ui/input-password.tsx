"use client";

import { useId, useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
};

export function InputPassword({
  label,
  placeholder,
  register,
  error,
  disabled,
  maxLength,
}: Props) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          className={`field pr-11 font-mono tracking-[0.22em] uppercase ${
            error ? "field-error" : ""
          }`}
          {...register}
        />

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted transition-colors hover:text-accent"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
