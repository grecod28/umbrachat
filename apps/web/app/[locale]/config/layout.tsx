import { Navbar } from "@/components/layout/navbar";
import { Route } from "@/libs/types/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
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
      label: t("shape"),
      href: "/config/shape",
    },
    {
      label: t("controls"),
      href: "/config/controls",
    },
  ];

  return (
    <section className="relative">
      <section className="md:flex md:justify-center md:mt-16 md:text-2xl">
        <Navbar routes={CONFIG_ROUTES} />
      </section>

      <main className="flex flex-col items-center">
        {children}
        <Link className="text-primary mt-4" href="/">
          Volver al inicio
        </Link>
      </main>
    </section>
  );
}
