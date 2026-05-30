"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoGridOutline } from "react-icons/io5";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("ChatLayout");

  return (
    <section className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-4 py-4 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
        >
          <IoArrowBack size={20} />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
        >
          <span className="text-sm font-medium">{t("myChats")}</span>
          <IoGridOutline size={20} />
        </Link>
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </section>
  );
}
