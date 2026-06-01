"use client";
import { API_URL } from "@/libs/constants/api";
import { useEffect, useState } from "react";
import { Room } from "@repo/database";
import { useTranslations } from "next-intl";
import { ChatCard } from "@/components/chat/chat-card";

export default function ChatListPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const cr = useTranslations("ChatRoom");

  useEffect(() => {
    const fetchRooms = async () => {
      // 1. Obtener los IDs del localStorage
      const storedChats = JSON.parse(localStorage.getItem("rooms") || "[]");
      console.log(storedChats);

      if (storedChats.length === 0) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      // 2. Construir los Query Params (?ids=1&ids=2...)
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
        <header className="my-6  text-center">
          <h1 className="text-primary text-2xl font-bold">Mis Chats</h1>
          <p className="text-text-muted">
            {rooms.length === 0
              ? "No tienes chats activos"
              : "Tus conversaciones recientes"}
          </p>
        </header>

        {isLoading ? (
          <p>Cargando salas...</p>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room: Room) => {
              console.log(room);

              return (
                <ChatCard
                  key={room.id}
                  id={room.id}
                  name={room.name}
                  description={room.description}
                  createdAt={new Date(room.createdAt).toLocaleString()}
                  lastMessageAt={new Date(room.lastMessageAt).toLocaleString()}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
