"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoShareSocial, IoSend } from "react-icons/io5";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Ana",
    text: "Hola a todos! Como van?",
    timestamp: "10:30",
    isOwn: false,
  },
  {
    id: "2",
    sender: "Tu",
    text: "Hey Ana! Todo bien por aqui, trabajando en el proyecto nuevo.",
    timestamp: "10:31",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Carlos",
    text: "Yo tambien ando metido en eso, esta quedando genial",
    timestamp: "10:33",
    isOwn: false,
  },
  {
    id: "4",
    sender: "Tu",
    text: "Si! La parte del chat en tiempo real quedo muy fluida",
    timestamp: "10:34",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Ana",
    text: "Me encanta el diseño, se ve super moderno",
    timestamp: "10:36",
    isOwn: false,
  },
  {
    id: "6",
    sender: "Carlos",
    text: "Cuando lo subimos a produccion?",
    timestamp: "10:37",
    isOwn: false,
  },
];

export default function ChatPage() {
  const t = useTranslations("ChatRoom");
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
        <Link
          href="/chat"
          className="text-text-muted hover:text-text transition-colors"
        >
          <IoArrowBack size={22} />
        </Link>

        <h1 className="text-sm font-semibold text-text truncate max-w-50">
          Sala de ejemplo
        </h1>

        <Link
          href="/chat/1/share"
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors"
        >
          <span className="text-xs font-medium">{t("share")}</span>
          <IoShareSocial size={18} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
          >
            {!msg.isOwn && (
              <span className="text-xs text-text-muted mb-1 px-1">
                {msg.sender}
              </span>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.isOwn
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-surface border border-border text-text rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-text-muted mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-background p-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("inputPlaceholder")}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors max-h-32"
          />
          <button
            title="Send message"
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0"
          >
            <IoSend size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
