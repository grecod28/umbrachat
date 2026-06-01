import { RootHeader } from "@/components/layout/headers";
import React from "react";

export default function MainLayout({
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
