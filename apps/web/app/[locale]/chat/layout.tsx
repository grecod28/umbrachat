import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SocketProvider } from "@/providers/socket-provider";

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

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
