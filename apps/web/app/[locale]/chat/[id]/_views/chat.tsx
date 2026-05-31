"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

const MAX_CHARS = 2048;

export default function Chat({ initMessages }: { initMessages: Message[] }) {
  const t = useTranslations("ChatRoom");
  const [messages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || input.length > MAX_CHARS) return;
    setInput("");
  };

  return (
    <>
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
      </div>
    </>
  );
}
