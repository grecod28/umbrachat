"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoAddOutline } from "react-icons/io5";
import { Brand } from "@/components/brand/brand";

export function ChatMobileBar() {
  const t = useTranslations("ChatLayout");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 backdrop-blur lg:hidden">
      <Link
        href="/chat/default"
        className="btn-icon"
        aria-label={t("back")}
        title={t("back")}
      >
        <IoArrowBack size={19} />
      </Link>

      <Brand href="/chat/default" size={26} showTagline={false} />

      <Link
        href="/chat/create"
        className="btn-icon"
        aria-label={t("newChat")}
        title={t("newChat")}
      >
        <IoAddOutline size={20} />
      </Link>
    </header>
  );
}
