"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { LANGUAGES } from "@/libs/constants/languages";
import { IoCheckmark, IoLanguageOutline } from "react-icons/io5";

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
      window.location.assign(`${window.location.origin}/${saved}${pathname}`);
    }
  }, [locale, pathname]);

  const handleChange = (value: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, value);
    setLocaleCookie(value);
    window.location.assign(`${window.location.origin}/${value}${pathname}`);
  };

  return (
    <section className="panel p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
          <IoLanguageOutline size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-text">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-text-muted">{t("description")}</p>
        </div>
      </div>

      <p className="field-label mt-6">{t("current")}</p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {LANGUAGES.map((language) => {
          const active = language.value === locale;
          return (
            <button
              key={language.value}
              type="button"
              onClick={() => handleChange(language.value)}
              aria-pressed={active}
              className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                active
                  ? "border-accent/40 bg-accent/10"
                  : "border-border bg-surface/50 hover:border-border-strong"
              }`}
            >
              <span
                className={`display flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg ${
                  active
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-text-muted"
                }`}
              >
                {language.value.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text">
                  {language.label}
                </span>
                <span className="mt-0.5 block font-mono text-[0.55rem] tracking-[0.14em] text-text-faint uppercase">
                  {language.value}
                </span>
              </span>
              {active && (
                <IoCheckmark size={17} className="shrink-0 text-accent" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-6 border-t border-border pt-4 font-mono text-[0.56rem] tracking-[0.14em] text-text-faint uppercase">
        {t("applies")}
      </p>
    </section>
  );
}
