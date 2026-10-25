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
  const { playTypingSound } = useTypingSound();

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
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"
        size={18}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => {
          playTypingSound();
          handleChange(event.target.value);
        }}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className="field h-12 pr-11 pl-11 text-[0.95rem]"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="btn-icon absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 border-transparent bg-transparent"
          aria-label={t("clear")}
        >
          <IoClose size={16} />
        </button>
      )}
    </div>
  );
}
