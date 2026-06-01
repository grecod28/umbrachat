"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { formatDate } from "@/libs/functions/format-date";

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

const MAX_CHARS = 2048;

export default function Chat({
  initMessages,
  roomId,
}: {
  initMessages: Message[];
  roomId: string;
}) {
  const t = useTranslations("ChatRoom");
  const [messages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = JSON.parse(localStorage.getItem("rooms") || "[]");
    const updated = [roomId, ...previous.filter((id: string) => id !== roomId)];
    localStorage.setItem("rooms", JSON.stringify(updated));

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomId, messages]);

  const handleSend = () => {
    if (!input.trim() || input.length > MAX_CHARS) return;
    setInput("");
  };

  return (
    <section>
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

      <footer className="fixed bottom-0 w-full shrink-0 border-t border-border bg-background p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              maxLength={MAX_CHARS}
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
              disabled={!input.trim() || input.length > MAX_CHARS}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoSend size={18} />
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
