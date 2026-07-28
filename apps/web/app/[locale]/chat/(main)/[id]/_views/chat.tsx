"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IoArrowDownOutline,
  IoArrowUp,
  IoArrowDown,
  IoClose,
  IoSearchOutline,
} from "react-icons/io5";
import { playSubmitSound } from "@/libs/functions/sounds";
import { useSocket } from "@/providers/socket-provider";
import { API_URL } from "@/libs/constants/api";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatFooter } from "./chat-footer";
import { type Message, type UploadStatus, MAX_CHARS, FIVE_MB } from "./types";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < threshold);
  }, []);

  useEffect(() => {
    const handler = () => {
      setSearchOpen((prev) => {
        const next = !prev;
        if (next) {
          setSearchQuery("");
          setSearchIndex(0);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        return next;
      });
    };
    window.addEventListener("toggle-chat-search", handler);
    return () => window.removeEventListener("toggle-chat-search", handler);
  }, []);

  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.reduce<number[]>((acc, msg, i) => {
      if (msg.content?.toLowerCase().includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [messages, searchQuery]);

  const scrollToMatch = useCallback(
    (index: number) => {
      const container = messagesContainerRef.current;
      if (!container) return;
      const msgIndex = matchingIndices[index];
      if (msgIndex == null) return;
      const children = container.children;
      const target = children[msgIndex] as HTMLElement | undefined;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [matchingIndices],
  );

  const goToNextMatch = useCallback(() => {
    setSearchIndex((prev) => {
      const next = prev + 1 >= matchingIndices.length ? 0 : prev + 1;
      setTimeout(() => scrollToMatch(next), 50);
      return next;
    });
  }, [matchingIndices.length, scrollToMatch]);

  const goToPrevMatch = useCallback(() => {
    setSearchIndex((prev) => {
      const next = prev - 1 < 0 ? matchingIndices.length - 1 : prev - 1;
      setTimeout(() => scrollToMatch(next), 50);
      return next;
    });
  }, [matchingIndices.length, scrollToMatch]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchIndex(0);
  }, []);

  useEffect(() => {
    const previous = JSON.parse(localStorage.getItem("rooms") || "[]");
    const updated = [
      roomIdRef.current,
      ...previous.filter((id: string) => id !== roomIdRef.current),
    ];
    localStorage.setItem("rooms", JSON.stringify(updated));
    window.dispatchEvent(new Event("rooms-changed"));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const storedRooms: string[] = JSON.parse(
      localStorage.getItem("rooms") || "[]",
    );

    storedRooms.forEach((id) => {
      socket.emit("join-room", {
        roomId: id,
        token: tokenRef.current ?? null,
      });
    });

    const clearUnread = () => {
      const key = "unread-counts";
      try {
        const counts: Record<string, number> = JSON.parse(
          localStorage.getItem(key) || "{}",
        );
        delete counts[roomIdRef.current];
        localStorage.setItem(key, JSON.stringify(counts));
        window.dispatchEvent(new Event("unread-counts-changed"));
      } catch {
        // ignore
      }
    };
    clearUnread();

    const onNewMessage = (msg: Message) => {
      const now = new Date().toISOString();

      try {
        const activityKey = "last-activity";
        const activity: Record<string, string> = JSON.parse(
          localStorage.getItem(activityKey) || "{}",
        );
        activity[msg.roomId!] = now;
        localStorage.setItem(activityKey, JSON.stringify(activity));
        window.dispatchEvent(new Event("last-activity-changed"));
      } catch {
        // ignore
      }

      if (msg.roomId === roomIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      } else {
        try {
          const key = "unread-counts";
          const counts: Record<string, number> = JSON.parse(
            localStorage.getItem(key) || "{}",
          );
          counts[msg.roomId!] = (counts[msg.roomId!] || 0) + 1;
          localStorage.setItem(key, JSON.stringify(counts));
          window.dispatchEvent(new Event("unread-counts-changed"));
        } catch {
          // ignore
        }
      }
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
      const existing: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (data.id) existing.push(data.id);
      if (data.ids) existing.push(...data.ids);
      localStorage.setItem(key, JSON.stringify(existing));
    };

    socket.on("new-message", onNewMessage);
    socket.on("user-typing", onUserTyping);
    socket.on("reply", onReply);

    return () => {
      storedRooms.forEach((id) => {
        socket.emit("leave-room", { roomId: id });
      });
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
    <section className="flex flex-col h-full relative">
      {searchOpen && (
        <div className="absolute top-0 left-0 w-full z-20 flex flex-wrap items-center gap-2 sm:gap-2.5 px-2 sm:px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 bg-surface border border-border rounded-lg px-2 sm:px-3 py-1.5">
            <IoSearchOutline size={16} className="text-text-muted shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchIndex(0);
              }}
              placeholder={t("searchMessages")}
              className="flex-1 min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-text-muted truncate"
            />
            {searchQuery.trim() && (
              <span className="text-[11px] text-text-muted shrink-0 tabular-nums">
                {matchingIndices.length > 0
                  ? t("searchMatch", {
                      current: searchIndex + 1,
                      total: matchingIndices.length,
                    })
                  : t("searchNoResults")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={goToPrevMatch}
              disabled={matchingIndices.length === 0}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous"
            >
              <IoArrowUp size={18} />
            </button>
            <button
              type="button"
              onClick={goToNextMatch}
              disabled={matchingIndices.length === 0}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next"
            >
              <IoArrowDown size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={closeSearch}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors shrink-0"
            title="Close search"
          >
            <IoClose size={18} />
          </button>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 pb-40 space-y-3 chat-bg"
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            searchHighlight={
              searchOpen && searchQuery.trim() ? searchQuery : undefined
            }
            isSearchActive={searchOpen && matchingIndices[searchIndex] === i}
          />
        ))}

        {isSomeoneTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <section className="relative text-xs text-text-muted text-center py-2 bg-transparent">
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
      </div>
    </section>
  );
}
