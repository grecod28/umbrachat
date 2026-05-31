import { Navbar } from "@/components/layout/navbar";
import { Route } from "@/libs/types/navigation";
import { getTranslations } from "next-intl/server";
import React from "react";

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Config");

  const CONFIG_ROUTES: Route[] = [
    {
      label: t("language"),
      href: "/config/language",
    },
    {
      label: t("form"),
      href: "/config/form",
    },
    {
      label: t("controls"),
      href: "/config/controls",
    },
  ];

  return (
    <section>
      <Navbar routes={CONFIG_ROUTES} />

      <main>{children}</main>
    </section>
  );
}
