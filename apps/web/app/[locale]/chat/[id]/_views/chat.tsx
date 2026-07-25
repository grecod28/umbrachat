"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoArrowDownOutline } from "react-icons/io5";
import { playSubmitSound } from "@/libs/functions/sounds";
import { useSocket } from "@/providers/socket-provider";
import { API_URL } from "@/libs/constants/api";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatFooter } from "./chat-footer";
import {
  type Message,
  type UploadStatus,
  MAX_CHARS,
  FIVE_MB,
} from "./types";

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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

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

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 50;
    setIsAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold,
    );
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

    const onReply = (data: {
      success: boolean;
      id?: string;
      ids?: string[];
    }) => {
      if (!data.success) return;
      const key = `own-msgs:${roomIdRef.current}`;
      const existing: string[] = JSON.parse(
        localStorage.getItem(key) || "[]",
      );
      if (data.id) existing.push(data.id);
      if (data.ids) existing.push(...data.ids);
      localStorage.setItem(key, JSON.stringify(existing));
    };

    socket.on("new-message", onNewMessage);
    socket.on("user-typing", onUserTyping);
    socket.on("reply", onReply);

    return () => {
      socket.emit("leave-room", { roomId: roomIdRef.current });
      socket.off("new-message", onNewMessage);
      socket.off("user-typing", onUserTyping);
      socket.off("reply", onReply);
    };
  }, [socket, scrollToBottom]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

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
      const allFiles = Array.from(e.target.files ?? []);
      const valid = allFiles.filter((file) => file.size <= FIVE_MB);
      const rejected = allFiles.length - valid.length;

      if (valid.length > 0) {
        setFiles((prev) => [...prev, ...valid]);
      }

      if (rejected > 0) {
        setUploadStatus("sizeError");
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
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
      setUploadStatus("uploading");

      const presignedPayload = {
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          contentType: file.type,
        })),
      };

      const url = new URL(`${API_URL}/rooms/${roomIdRef.current}/upload-urls`);
      if (tokenRef.current) url.searchParams.set("token", tokenRef.current);

      fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presignedPayload),
      })
        .then((res) => res.json())
        .then(
          (data: {
            files: {
              key: string;
              url: string;
              fields: Record<string, string>;
            }[];
          }) => {
            const uploadedFiles: {
              key: string;
              fileName: string;
              mimeType: string;
              size: number;
            }[] = [];

            const uploads = data.files.map((presigned, idx) => {
              const file = files[idx];
              if (!file) return Promise.resolve();

              const formData = new FormData();
              if (presigned.fields) {
                Object.entries(presigned.fields).forEach(([key, value]) => {
                  formData.append(key, value);
                });
              }

              formData.append("file", file);

              return fetch(presigned.url, {
                method: "POST",
                body: formData,
              }).then(() => {
                uploadedFiles.push({
                  key: presigned.key,
                  fileName: file.name,
                  mimeType: file.type,
                  size: file.size,
                });
              });
            });

            return Promise.allSettled(uploads).then((results) => {
              const allOk = results.every((r) => r.status === "fulfilled");

              if (allOk && uploadedFiles.length > 0 && socket) {
                socket.emit("send-files", {
                  roomId: roomIdRef.current,
                  files: uploadedFiles,
                });
              }

              if (allOk) {
                setFiles([]);
              }

              setUploadStatus(allOk ? "success" : "error");
              setTimeout(() => setUploadStatus("idle"), 3000);
            });
          },
        )
        .catch(() => {
          setUploadStatus("error");
          setTimeout(() => setUploadStatus("idle"), 3000);
        });
    }

    playSubmitSound();
  }, [input, files, socket, emitTyping]);

  const hasContent = input.trim().length > 0 && input.length <= MAX_CHARS;
  const canSend = hasContent || files.length > 0;

  return (
    <section className="flex flex-col h-full">
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isSomeoneTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <section className="relative shrink-0 text-xs text-text-muted text-center py-4 bg-background">
        <p>{t("expireNotice")}</p>

        {!isAtBottom && (
          <button
            title="scroll bottom button"
            type="button"
            onClick={scrollToBottom}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-text animate-float"
          >
            <IoArrowDownOutline size={24} />
          </button>
        )}
      </section>

      <ChatFooter
        input={input}
        canSend={canSend}
        files={files}
        uploadStatus={uploadStatus}
        onInputChange={handleInputChange}
        onSend={handleSend}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
      />
    </section>
  );
}
