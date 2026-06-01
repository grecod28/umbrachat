import { RootHeader } from "@/components/layout/headers";
import React from "react";

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
