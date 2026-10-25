import { RootHeader } from "@/components/layout/headers";
import { SiteFooter } from "@/components/layout/site-footer";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <RootHeader />
      <div className="flex-1 pt-16 md:pt-20">{children}</div>
      <SiteFooter />
    </div>
  );
}
