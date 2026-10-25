"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IoColorPaletteOutline, IoLanguageOutline } from "react-icons/io5";

const tabs = [
  {
    key: "tabLanguage",
    href: "/config/language",
    icon: IoLanguageOutline,
  },
  {
    key: "tabShape",
    href: "/config/shape",
    icon: IoColorPaletteOutline,
  },
] as const;

export function ConfigTabs() {
  const t = useTranslations("Config");
  const pathname = usePathname();

  return (
    <nav
      className="panel-quiet mt-7 grid grid-cols-2 gap-1 p-1 sm:inline-grid sm:auto-cols-max sm:grid-flow-col"
      aria-label={t("title")}
    >
      {tabs.map(({ key, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-mono text-[0.63rem] tracking-[0.13em] uppercase transition-colors ${
              active
                ? "bg-surface-2 text-accent"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Icon size={15} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
