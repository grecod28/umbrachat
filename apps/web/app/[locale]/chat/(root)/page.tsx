"use client";
import { API_URL } from "@/libs/constants/api";
import { useEffect, useState } from "react";
import { RoomWithPrivate } from "@repo/database";
import { useTranslations } from "next-intl";
import { ChatCard } from "@/components/chat/chat-card";
import { Link } from "@/i18n/navigation";

export default function ChatListPage() {
  const [rooms, setRooms] = useState<RoomWithPrivate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("ChatList");

  useEffect(() => {
    const fetchRooms = async () => {
      const storedChats = JSON.parse(localStorage.getItem("rooms") || "[]");

      if (storedChats.length === 0) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      storedChats.forEach((id: string) => params.append("ids", id));

      try {
        const response = await fetch(`${API_URL}/rooms?${params.toString()}`);
        if (!response.ok) throw new Error("Error al cargar las salas");

        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <main className="pt-20 pb-24 px-4 max-w-4xl mx-auto w-full">
      <section>
        <header className="my-6 text-center">
          <h1 className="text-primary text-2xl font-bold">{t("title")}</h1>
          <p className="text-text-muted">
            {rooms.length === 0 ? t("empty") : t("recent")}
          </p>
        </header>

        {isLoading ? (
          <p className="text-center text-text-muted">{t("loading")}</p>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room: RoomWithPrivate) => (
              <ChatCard
                isPrivate={room.isPrivate}
                key={room.id}
                id={room.id}
                name={room.name}
                description={room.description}
                createdAt={room.createdAt}
                lastMessageAt={room.lastMessageAt}
              />
            ))}
          </div>
        )}
      </section>

      <footer className=" max-w-4xl mx-auto fixed bottom-0 left-1/2 -translate-x-1/2 w-full p-4 bg-background border-t border-border">
        <Link
          href="/chat/create"
          className="block py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:brightness-110 text-center"
        >
          {t("create")}
        </Link>
      </footer>
    </main>
  );
}
