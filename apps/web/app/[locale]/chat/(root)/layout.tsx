import { RootHeader } from "@/components/layout/headers";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("chat.title"),
    description: t("chat.description"),
  };
}

export default function ChatRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RootHeader />
      {children}
    </>
  );
}
