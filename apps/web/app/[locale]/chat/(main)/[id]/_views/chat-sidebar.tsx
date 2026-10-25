"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { API_URL } from "@/libs/constants/api";
import { formatDate } from "@/libs/functions/format-date";
import {
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { LuMessageSquarePlus } from "react-icons/lu";
import type { RoomWithPrivate } from "@repo/database";
import NavChip from "@/components/navigation/nav-chip";
import { Brand } from "@/components/brand/brand";
import { Eclipse } from "@/components/brand/eclipse";
import { ChatHeaderMenu } from "./chat-header-menu";

export function ChatSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations("ChatList");
  const [rooms, setRooms] = useState<RoomWithPrivate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(
    {},
  );
  const [lastActivity, setLastActivity] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => {
      try {
        setFavorites(JSON.parse(localStorage.getItem("fav-rooms") || "[]"));
      } catch {
        setFavorites([]);
      }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("fav-rooms-changed", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("fav-rooms-changed", load);
    };
  }, []);

  useEffect(() => {
    const load = () => {
      try {
        setUnreadCounts(
          JSON.parse(localStorage.getItem("unread-counts") || "{}"),
        );
      } catch {
        setUnreadCounts({});
      }
      try {
        setLastActivity(
          JSON.parse(localStorage.getItem("last-activity") || "{}"),
        );
      } catch {
        setLastActivity({});
      }
    };
    load();
    const handler = () => load();
    window.addEventListener("storage", handler);
    window.addEventListener("unread-counts-changed", handler);
    window.addEventListener("last-activity-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("unread-counts-changed", handler);
      window.removeEventListener("last-activity-changed", handler);
    };
  }, []);

  const loadRooms = useCallback(async () => {
    setLoadError(false);
    let storedChats: string[] = [];
    try {
      storedChats = JSON.parse(localStorage.getItem("rooms") || "[]");
    } catch {
      storedChats = [];
    }

    if (storedChats.length === 0) {
      setRooms([]);
      setIsLoading(false);
      return;
    }

    const params = new URLSearchParams();
    storedChats.forEach((id) => params.append("ids", id));

    try {
      const response = await fetch(`${API_URL}/rooms?${params.toString()}`);
      if (!response.ok) throw new Error("Error loading rooms");
      const data: RoomWithPrivate[] = await response.json();
      setRooms(data);
      const names: Record<string, string> = {};
      data.forEach((room) => {
        names[room.id] = room.name || "Untitled chat";
      });
      localStorage.setItem("room-names", JSON.stringify(names));
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Rooms live in localStorage and are fetched from the API after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
    window.addEventListener("rooms-changed", loadRooms);
    return () => window.removeEventListener("rooms-changed", loadRooms);
  }, [loadRooms]);

  const filtered = useMemo(() => {
    let result = rooms;

    if (filter === "favorites") {
      result = result.filter((room) => favorites.includes(room.id));
    }

    if (filter === "unread") {
      result = result.filter((room) => (unreadCounts[room.id] || 0) > 0);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((room) =>
        room.name.toLowerCase().includes(query),
      );
    }

    return [...result].sort((a, b) => {
      const aTime = lastActivity[a.id]
        ? new Date(lastActivity[a.id]).getTime()
        : new Date(a.lastMessageAt).getTime();
      const bTime = lastActivity[b.id]
        ? new Date(lastActivity[b.id]).getTime()
        : new Date(b.lastMessageAt).getTime();
      return bTime - aTime;
    });
  }, [rooms, search, filter, favorites, unreadCounts, lastActivity]);

  const emptyLabel = search.trim()
    ? t("noResults")
    : filter === "favorites"
      ? t("noFavorites")
      : filter === "unread"
        ? t("noUnread")
        : t("empty");

  return (
    <aside
      className={`h-full min-h-0 flex-col border-r border-border bg-surface/35 ${className}`}
    >
      <header className="shrink-0 border-b border-border px-3 pb-3 pt-3 lg:px-4">
        <div className="flex items-center justify-between gap-2">
          <Brand href="/chat/default" size={30} showTagline={false} />
          <div className="flex items-center gap-1">
            <Link
              href="/chat/create"
              className="btn-icon"
              aria-label={t("newChat")}
              title={t("newChat")}
            >
              <LuMessageSquarePlus size={18} />
            </Link>
            <ChatHeaderMenu />
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mono-label text-text-faint">{t("eyebrow")}</p>
            <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-text">
              {t("title")}
            </h2>
          </div>
          <span className="font-mono text-[0.62rem] tracking-[0.18em] text-text-faint">
            {String(rooms.length).padStart(2, "0")}
          </span>
        </div>

        <div className="relative mt-4">
          <IoSearchOutline
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="field h-10 py-0 pr-3 pl-9 text-[0.82rem]"
          />
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          <NavChip param="filter" value="">
            {t("filterAll")}
          </NavChip>
          <NavChip param="filter" value="unread">
            {t("filterUnread")}
          </NavChip>
          <NavChip param="filter" value="favorites">
            {t("filterFavorites")}
          </NavChip>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {isLoading ? (
          <div className="space-y-2 px-1" aria-label={t("loading")}>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-[4.4rem] animate-pulse rounded-lg border border-border/60 bg-surface-2/40"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm text-text-muted">{t("loadError")}</p>
            <button
              type="button"
              onClick={loadRooms}
              className="btn btn-secondary btn-sm mt-4"
            >
              {t("retry")}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="relative flex flex-col items-center px-5 py-14 text-center">
            <Eclipse className="h-24 w-24 text-primary/30" />
            <p className="mt-5 text-sm leading-relaxed text-text-muted">
              {emptyLabel}
            </p>
            {rooms.length === 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Link href="/chat/create" className="btn btn-primary btn-sm">
                  {t("create")}
                </Link>
                <Link href="/chat/search" className="btn btn-secondary btn-sm">
                  {t("searchRooms")}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((room) => {
              const roomPath = `/chat/${room.id}`;
              const isActive = pathname === roomPath;
              const unread = unreadCounts[room.id] || 0;

              return (
                <Link
                  key={room.id}
                  href={roomPath}
                  data-active={isActive}
                  className={`room-tab flex flex-col gap-1.5 rounded-lg px-3 py-3 ${
                    isActive ? "text-text" : "text-text-soft"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[0.83rem] font-medium">
                      {room.name || t("noTitle")}
                    </span>
                    {!isActive && unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[0.58rem] font-bold text-accent-contrast">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[0.68rem] text-text-muted">
                    {room.isPrivate && (
                      <IoLockClosedOutline size={11} className="shrink-0" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {room.description || t("noMessages")}
                    </span>
                    <span className="shrink-0 font-mono text-[0.58rem] text-text-faint">
                      {formatDate(room.lastMessageAt, "time")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="safe-bottom shrink-0 border-t border-border px-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="status-line min-w-0">
            <IoShieldCheckmarkOutline
              size={13}
              className="shrink-0 text-signal"
            />
            <span className="truncate">{t("incognito")}</span>
          </p>
          <span className="font-mono text-[0.55rem] tracking-[0.16em] text-text-faint">
            24H
          </span>
        </div>
        <p className="mt-1 font-mono text-[0.55rem] tracking-[0.12em] text-text-faint uppercase">
          {t("status")}
        </p>
      </footer>
    </aside>
  );
}
