"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { FiSearch } from "react-icons/fi";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";

export default function SearchForm() {
  const t = useTranslations("Search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("name") || "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { withSound } = useTypingSound();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue) {
        params.set("name", newValue);
      } else {
        params.delete("name");
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    }, 300);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="relative">
      <FiSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        size={20}
      />
      <input
        type="text"
        value={value}
        onChange={withSound(handleChange)}
        placeholder={t("placeholder")}
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  );
}
