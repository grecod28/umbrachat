"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoLockClosedOutline,
  IoShareSocial,
} from "react-icons/io5";
import { ChatSearchBtn } from "./chat-search-btn";
import { ChatRoomMenu } from "./chat-room-menu";

export function ChatRoomHeader({
  roomId,
  name,
  description,
  isPrivate = false,
}: {
  roomId: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
}) {
  const t = useTranslations("ChatRoom");
  const nav = useTranslations("ChatLayout");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-3 backdrop-blur md:h-[4.5rem] md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/chat/default"
          className="btn-icon lg:hidden"
          aria-label={nav("back")}
        >
          <IoArrowBack size={19} />
        </Link>

        <div className="min-w-0">
          <p className="mono-label flex items-center gap-2 text-text-faint">
            <span className="status-dot" />
            <span className="truncate">
              {isPrivate ? t("privateRoom") : t("publicRoom")}
            </span>
            <span className="hidden text-text-faint/70 sm:inline">/ 24H</span>
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <h1
              className="truncate text-[0.92rem] font-semibold tracking-tight text-text"
              title={name || t("noTitle")}
            >
              {name || t("noTitle")}
            </h1>
            {isPrivate && (
              <IoLockClosedOutline
                size={12}
                className="shrink-0 text-accent"
                aria-hidden="true"
              />
            )}
          </div>
          {description && (
            <p className="mt-0.5 hidden max-w-md truncate text-[0.68rem] text-text-muted sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <ChatSearchBtn />
        <Link
          href={`/chat/${roomId}/share`}
          className="btn-icon"
          title={t("share")}
          aria-label={t("share")}
        >
          <IoShareSocial size={17} />
        </Link>
        <ChatRoomMenu roomId={roomId} />
      </div>
    </header>
  );
}
