"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { LANGUAGES } from "@/libs/constants/languages";

export default function ConfigLanguagePage() {
  const t = useTranslations("ConfigLanguage");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: string) => {
    localStorage.setItem("umbra-locale", value);
    router.replace(pathname, { locale: value });
  };

  return (
    <div className="flex flex-col items-center mt-16 px-4 w-full">
      <div className="animate-fade-in w-full max-w-xs space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-text tracking-tight">
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
