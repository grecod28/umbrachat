"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";

export default function SearchForm() {
  const t = useTranslations("Search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("name") || "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { withSound } = useTypingSound();

  const handleChange = (newValue: string) => {
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue) {
        params.set("name", newValue);
        params.delete("page");
      } else {
        params.delete("name");
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    }, 300);
  };

  const handleClear = () => {
    setValue("");
    router.replace(pathname);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <IoSearchOutline
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        size={20}
      />
      <input
        type="text"
        value={value}
        onChange={withSound((e) => handleChange(e.target.value))}
        placeholder={t("placeholder")}
        className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-10 text-text placeholder:text-text-muted/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition-colors hover:bg-surface hover:text-text"
        >
          <IoClose size={18} />
        </button>
      )}
    </div>
  );
}
