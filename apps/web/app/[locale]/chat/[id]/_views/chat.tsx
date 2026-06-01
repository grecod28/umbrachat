"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoArrowDownOutline, IoSend } from "react-icons/io5";
import { formatDate } from "@/libs/functions/format-date";
import { playSubmitSound } from "@/libs/functions/sounds";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";
import { useSocket } from "@/providers/socket-provider";

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

const MAX_CHARS = 2048;

export default function Chat({
  initMessages,
  roomId,
  token,
}: {
  initMessages: Message[];
  roomId: string;
  token?: string | null;
}) {
  const t = useTranslations("ChatRoom");
  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const { withSound } = useTypingSound();

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const previous = JSON.parse(localStorage.getItem("rooms") || "[]");
    const updated = [
      roomIdRef.current,
      ...previous.filter((id: string) => id !== roomIdRef.current),
    ];
    localStorage.setItem("rooms", JSON.stringify(updated));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-room", {
      roomId: roomIdRef.current,
      token: tokenRef.current ?? null,
    });

    const onNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new-message", onNewMessage);

    return () => {
      socket.emit("leave-room", { roomId: roomIdRef.current });
      socket.off("new-message", onNewMessage);
    };
  }, [socket, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!input.trim() || input.length > MAX_CHARS || !socket) return;
    socket.emit("send-message", {
      roomId: roomIdRef.current,
      content: input.trim(),
    });
    playSubmitSound();
    setInput("");
  }, [input, socket]);

  return (
    <section className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 mt-1 rounded-full bg-linear-to-br from-primary/30 to-accent/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary/70">?</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="rounded-xl bg-surface border border-border px-3 py-2">
                <p className="text-sm text-text leading-relaxed wrap-break-words">
                  {msg.content}
                </p>
              </div>
              <p className="text-[10px] text-text-muted mt-1 ml-1">
                {formatDate(msg.createdAt, "time")}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="shrink-0 border-t border-border bg-background p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              maxLength={MAX_CHARS}
              onChange={withSound((e) => setInput(e.target.value))}
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
              title="send message button"
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || input.length > MAX_CHARS}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoSend size={18} />
            </button>

            <button
              title="scroll bottom button"
              type="button"
              onClick={scrollToBottom}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoArrowDownOutline size={18} />
            </button>
          </div>
          <span
            className={`text-xs text-right px-1 ${
              input.length > MAX_CHARS
                ? "text-danger"
                : input.length > MAX_CHARS * 0.9
                  ? "text-warning"
                  : "text-text-muted"
            }`}
          >
            {input.length}/{MAX_CHARS}
          </span>
        </div>
      </footer>
    </section>
  );
}
