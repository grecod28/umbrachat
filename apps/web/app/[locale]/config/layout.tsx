import { Navbar } from "@/components/layout/navbar";
import { Route } from "@/libs/types/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";
import { ConfigBackButton } from "./_views/config-back-button";
import {
  IoLanguageOutline,
  IoColorPaletteOutline,
} from "react-icons/io5";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("config.title"),
    description: t("config.description"),
  };
}

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Config");

  const CONFIG_ROUTES: Route[] = [
    { label: t("language"), href: "/config/language" },
    { label: t("shape"), href: "/config/shape" },
  ];

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-lg">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text">Settings</h1>
          <ConfigBackButton />
        </div>

        <nav className="mb-10 flex gap-2">
          <Navbar routes={CONFIG_ROUTES} />
        </nav>

        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
