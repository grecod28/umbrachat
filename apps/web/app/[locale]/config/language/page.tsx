"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { LANGUAGES } from "@/libs/constants/languages";

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
    <div className="flex flex-col items-center mt-16 px-4 w-full">
      <div className="animate-fade-in w-full max-w-xs space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-text-muted">{t("description")}</p>
        </div>

        <Select
          label={t("title")}
          options={LANGUAGES}
          value={locale}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
