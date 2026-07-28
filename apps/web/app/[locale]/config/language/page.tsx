"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { LANGUAGES } from "@/libs/constants/languages";
import { IoLanguageOutline } from "react-icons/io5";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_STORAGE_KEY = "umbra-locale";

function setLocaleCookie(value: string) {
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function ConfigLanguagePage() {
  const t = useTranslations("ConfigLanguage");
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && saved !== locale && LANGUAGES.some((l) => l.value === saved)) {
      setLocaleCookie(saved);
      window.location.href = `${window.location.origin}/${saved}${pathname}`;
    }
  }, []);

  const handleChange = (value: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, value);
    setLocaleCookie(value);
    window.location.href = `${window.location.origin}/${value}${pathname}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IoLanguageOutline size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">{t("title")}</h2>
          <p className="text-sm text-text-muted">{t("description")}</p>
        </div>
      </div>

      <Select
        label={t("title")}
        options={LANGUAGES}
        value={locale}
        onChange={handleChange}
      />
    </div>
  );
}
