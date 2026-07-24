"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IoArrowDownOutline,
  IoAttachOutline,
  IoClose,
  IoSend,
} from "react-icons/io5";
import { formatDate } from "@/libs/functions/format-date";
import { playSubmitSound } from "@/libs/functions/sounds";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";
import { useSocket } from "@/providers/socket-provider";
import { API_URL } from "@/libs/constants/api";

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

const MAX_CHARS = 2048;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const { withSound } = useTypingSound();

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

    const onUserTyping = (data: { userId: string; isTyping: boolean }) => {
      setIsSomeoneTyping(data.isTyping);

      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
      }

      if (data.isTyping) {
        otherTypingTimeoutRef.current = setTimeout(() => {
          setIsSomeoneTyping(false);
        }, 3000);
      }
    };

    socket.on("new-message", onNewMessage);
    socket.on("user-typing", onUserTyping);

    return () => {
      socket.emit("leave-room", { roomId: roomIdRef.current });
      socket.off("new-message", onNewMessage);
      socket.off("user-typing", onUserTyping);
    };
  }, [socket, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket) return;
      socket.emit("user-typing", {
        roomId: roomIdRef.current,
        isTyping,
      });
    },
    [socket],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (value.trim()) {
        emitTyping(true);
        typingTimeoutRef.current = setTimeout(() => {
          emitTyping(false);
        }, 1500);
      } else {
        emitTyping(false);
      }
    },
    [emitTyping],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      setFiles((prev) => [...prev, ...selected]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    if ((!input.trim() || input.length > MAX_CHARS) && files.length === 0)
      return;
    if (!socket) return;

    if (input.trim() && input.length <= MAX_CHARS) {
      socket.emit("send-message", {
        roomId: roomIdRef.current,
        content: input.trim(),
      });
      setInput("");
      emitTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    if (files.length > 0) {
      const data = {
        files: files.map((file) => {
          return {
            name: file.name,
            size: file.size,
            contentType: file.type,
          };
        }),
      };

      const url = new URL(`${API_URL}/rooms/${roomIdRef.current}/upload-urls`);
      if (tokenRef.current) url.searchParams.set("token", tokenRef.current);

      fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Upload URLs:", data);
          // Handle the upload URLs as needed
        })
        .catch((err) => {
          console.error("Error fetching upload URLs:", err);
        });
    }

    playSubmitSound();
  }, [input, files, socket, emitTyping]);

  const hasContent = input.trim().length > 0 && input.length <= MAX_CHARS;
  const canSend = hasContent || files.length > 0;

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

        {isSomeoneTyping && (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 mt-1 rounded-full bg-linear-to-br from-primary/30 to-accent/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary/70">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="rounded-xl bg-surface border border-border px-3 py-2">
                <div className="flex items-center gap-1 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <section className="relative shrink-0 text-xs text-text-muted text-center py-4 bg-background">
        <p>{t("expireNotice")}</p>

        <button
          title="scroll bottom button"
          type="button"
          onClick={scrollToBottom}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-text animate-float"
        >
          <IoArrowDownOutline size={24} />
        </button>
      </section>

      <footer className="shrink-0 border-t border-border bg-background p-3 flex flex-col gap-1">
        <div className="flex items-end gap-2">
          <button
            title="attach file"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:border-primary/60 transition-colors shrink-0"
          >
            <IoAttachOutline size={18} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            rows={1}
            value={input}
            maxLength={MAX_CHARS}
            onChange={withSound((e) => handleInputChange(e.target.value))}
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
            disabled={!canSend}
            className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IoSend size={18} />
          </button>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs"
              >
                <span className="text-text truncate max-w-40">{file.name}</span>
                <span className="text-text-muted shrink-0">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  title="remove file"
                  onClick={() => removeFile(i)}
                  className="text-text-muted hover:text-danger transition-colors shrink-0"
                >
                  <IoClose size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

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
      </footer>
    </section>
  );
}
