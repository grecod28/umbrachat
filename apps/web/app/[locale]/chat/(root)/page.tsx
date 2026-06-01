"use client";
import { API_URL } from "@/libs/constants/api";
import { useEffect, useState } from "react";
import { Room, RoomWithPrivate } from "@repo/database";
import { useTranslations } from "next-intl";
import { ChatCard } from "@/components/chat/chat-card";

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
    <main className="py-20 px-4">
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
    </main>
  );
}
