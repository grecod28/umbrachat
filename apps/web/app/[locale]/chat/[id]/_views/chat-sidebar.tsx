"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { API_URL } from "@/libs/constants/api";
import { formatDate } from "@/libs/functions/format-date";
import { IoSearchOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import type { RoomWithPrivate } from "@repo/database";

export function ChatSidebar() {
  const t = useTranslations("ChatList");
  const pathname = usePathname();
  const [rooms, setRooms] = useState<RoomWithPrivate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        setRooms(
          data.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          ),
        );
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rooms;
    const q = search.toLowerCase();
    return rooms.filter((r) => r.name.toLowerCase().includes(q));
  }, [rooms, search]);

  return (
    <aside className="hidden lg:flex lg:flex-col w-80 shrink-0 border-r border-border bg-background h-full">
      <header className="shrink-0 px-4 py-3 border-b border-border">
        <Link
          href="/chat"
          className="text-sm font-semibold text-text hover:text-primary transition-colors"
        >
          {t("title")}
        </Link>
      </header>

      <div className="shrink-0 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
          <IoSearchOutline size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-text-muted">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-text-muted mb-3">
              {search.trim() ? "No results" : t("empty")}
            </p>
            {!search.trim() && (
              <Link
                href="/chat/create"
                className="inline-block px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                {t("create")}
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((room) => {
              const roomPath = `/chat/${room.id}`;
              const isActive = pathname === roomPath;

              return (
                <Link
                  key={room.id}
                  href={roomPath}
                  className={`flex flex-col px-4 py-3 border-b border-border/50 transition-colors hover:bg-surface ${
                    isActive ? "bg-primary/10 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      {room.name || t("noTitle")}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {room.description ||
                      formatDate(room.lastMessageAt, "time")}
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
