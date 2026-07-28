"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { API_URL } from "@/libs/constants/api";
import { formatDate } from "@/libs/functions/format-date";
import { IoSearchOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import type { RoomWithPrivate } from "@repo/database";
import { LuMessageSquarePlus } from "react-icons/lu";
import NavChip from "@/components/navigation/nav-chip";
import { ChatHeaderMenu } from "./chat-header-menu";

export function ChatSidebar() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const t = useTranslations("ChatList");
  const [rooms, setRooms] = useState<RoomWithPrivate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(
    {},
  );
  const [lastActivity, setLastActivity] = useState<Record<string, string>>(
    {},
  );

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

  useEffect(() => {
    const fetchRooms = async () => {
      const storedChats: string[] = JSON.parse(
        localStorage.getItem("rooms") || "[]",
      );

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
        data.forEach((r) => {
          names[r.id] = r.name || "Untitled chat";
        });
        localStorage.setItem("room-names", JSON.stringify(names));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
    window.addEventListener("rooms-changed", fetchRooms);
    return () => window.removeEventListener("rooms-changed", fetchRooms);
  }, []);

  const filtered = useMemo(() => {
    let result = rooms;

    if (filter === "favorites") {
      result = result.filter((r) => favorites.includes(r.id));
    }

    if (filter === "unread") {
      result = result.filter((r) => (unreadCounts[r.id] || 0) > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
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

  return (
    <aside
      className={`${id !== "default" ? "hidden lg:flex" : "flex"} h-full w-full flex-col border-r border-border bg-background lg:w-80 lg:shrink-0`}
    >
      <header className="shrink-0 px-4 py-2">
        <section className="flex justify-between items-center ">
          <h2 className="text-sm font-semibold text-text">{t("title")}</h2>

          <section className="flex gap-8 px-3 py-2">
            <Link
              href="/chat/create"
              className="p-1.5 text-sm rounded-lg! hover:bg-surface transition-colors"
            >
              <LuMessageSquarePlus size={20} />
            </Link>

            <ChatHeaderMenu />
          </section>
        </section>
      </header>

      <section className="shrink-0 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-3xl bg-surface border border-border">
          <IoSearchOutline size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
          />
        </div>

        <section className="flex gap-1 mt-2">
          <NavChip param="filter" value="">
            Todos
          </NavChip>
          <NavChip param="filter" value="unread">
            No leídos
          </NavChip>
          <NavChip param="filter" value="favorites">
            Favoritos
          </NavChip>
        </section>
      </section>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-text-muted">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-text-muted mb-3">
              {search.trim()
                ? "No results"
                : filter === "favorites"
                  ? "No favorites yet"
                  : filter === "unread"
                    ? "No unread messages"
                    : t("empty")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col p-2">
            {filtered.map((room) => {
              const roomPath = `/chat/${room.id}`;
              const isActive = pathname === roomPath;
              const unread = unreadCounts[room.id] || 0;

              return (
                <Link
                  key={room.id}
                  href={roomPath}
                  className={`flex flex-col rounded-xl px-4 py-3 transition-colors hover:bg-surface ${
                    isActive ? "bg-primary/10 border-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate flex-1">
                      {room.name || t("noTitle")}
                    </span>
                    {!isActive && unread > 0 && (
                      <span className="shrink-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1.5">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {room.description || formatDate(room.lastMessageAt, "time")}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="shrink-0 px-4 py-3 border-t border-border">
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <IoShieldCheckmarkOutline size={14} className="text-emerald-400" />
          {t("incognito")}
        </p>
      </footer>
    </aside>
  );
}
