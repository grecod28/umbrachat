"use client";

import { usePathname } from "@/i18n/navigation";
import { ChatSidebar } from "@/app/[locale]/chat/(main)/[id]/_views/chat-sidebar";
import { ChatMobileBar } from "./chat-mobile-bar";

export function ChatShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDefault = pathname === "/chat/default";
  const isRoom = /^\/chat\/(?!create$|search$|default$)[^/]+$/.test(pathname);
  const showMobileBar = !isDefault && !isRoom;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar
        className={
          isDefault
            ? "flex w-full lg:w-[21rem] lg:shrink-0"
            : "hidden lg:flex lg:w-[21rem] lg:shrink-0"
        }
      />

      <div
        className={`${isDefault ? "hidden lg:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col`}
      >
        {showMobileBar && <ChatMobileBar />}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
