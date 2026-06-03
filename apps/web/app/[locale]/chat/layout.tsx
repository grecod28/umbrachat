import { SocketProvider } from "@/providers/socket-provider";
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
    title: t("shareChat.title"),
    description: t("shareChat.description"),
  };
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
