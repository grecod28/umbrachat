import { RootHeader } from "@/components/layout/headers";
import { PageHeading } from "@/components/layout/page-heading";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";
import { ConfigBackButton } from "./_views/config-back-button";
import { ConfigTabs } from "./_views/config-tabs";

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

  return (
    <div className="min-h-dvh">
      <RootHeader />

      <div className="pt-16 md:pt-20">
        <div className="page-shell max-w-3xl py-10 md:py-14">
          <div className="mb-5 flex justify-end">
            <ConfigBackButton />
          </div>

          <PageHeading
            eyebrow={`${t("title")} / 004`}
            title={t("title")}
            description={t("subtitle")}
          />

          <ConfigTabs />

          <div className="mt-6">{children}</div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5">
            <span className="status-line">
              <span className="status-dot" />
              {t("localPreferences")}
            </span>
            <span className="mono-label">{t("storedOnDevice")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
