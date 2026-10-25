"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IoArrowDown,
  IoArrowUp,
  IoChevronDown,
  IoClose,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { playSubmitSound } from "@/libs/functions/sounds";
import { useSocket } from "@/providers/socket-provider";
import { API_URL } from "@/libs/constants/api";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatFooter } from "./chat-footer";
import { Eclipse } from "@/components/brand/eclipse";
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
  const tokenRef = useRef(token);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

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
    const threshold = 70;
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
    const query = searchQuery.toLowerCase();
    return messages.reduce<number[]>((acc, message, index) => {
      if (message.content?.toLowerCase().includes(query)) acc.push(index);
      return acc;
    }, []);
  }, [messages, searchQuery]);

  const scrollToMatch = useCallback(
    (index: number) => {
      const container = messagesContainerRef.current;
      if (!container) return;
      const messageIndex = matchingIndices[index];
      if (messageIndex == null) return;
      const target = container.querySelector<HTMLElement>(
        `[data-message-index="${messageIndex}"]`,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(event.target.files ?? []);
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
    setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
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

            const uploads = data.files.map((presigned, index) => {
              const file = files[index];
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
              const allOk = results.every(
                (result) => result.status === "fulfilled",
              );

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
    <section className="relative flex h-full min-h-0 flex-col">
      {searchOpen && (
        <div className="shrink-0 border-b border-border bg-background/90 px-3 py-2 backdrop-blur md:px-5">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <IoSearchOutline
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchIndex(0);
                }}
                placeholder={t("searchMessages")}
                className="field h-9 py-0 pr-3 pl-9 text-[0.8rem]"
              />
            </div>

            {searchQuery.trim() && (
              <span className="shrink-0 font-mono text-[0.6rem] text-text-muted tabular-nums">
                {matchingIndices.length > 0
                  ? t("searchMatch", {
                      current: searchIndex + 1,
                      total: matchingIndices.length,
                    })
                  : t("searchNoResults")}
              </span>
            )}

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={goToPrevMatch}
                disabled={matchingIndices.length === 0}
                className="btn-icon h-8 w-8"
                aria-label={t("searchPrevious")}
              >
                <IoArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={goToNextMatch}
                disabled={matchingIndices.length === 0}
                className="btn-icon h-8 w-8"
                aria-label={t("searchNext")}
              >
                <IoArrowDown size={15} />
              </button>
              <button
                type="button"
                onClick={closeSearch}
                className="btn-icon h-8 w-8"
                aria-label={t("searchClose")}
              >
                <IoClose size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="dossier-grid absolute inset-0" />
          <Eclipse className="absolute -right-32 -bottom-40 h-[32rem] w-[32rem] text-primary/10 md:h-[42rem] md:w-[42rem]" />
          <Eclipse className="absolute -top-48 -left-40 h-[28rem] w-[28rem] text-accent/10" />
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5 px-4 py-6 md:px-8 md:py-8">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <p className="mono-label text-text-faint">
                  {t("emptyRoomEyebrow")}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
                  {t("emptyRoom")}
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={message.id} data-message-index={index}>
                <MessageBubble
                  message={message}
                  searchHighlight={
                    searchOpen && searchQuery.trim()
                      ? searchQuery
                      : undefined
                  }
                  isSearchActive={
                    searchOpen && matchingIndices[searchIndex] === index
                  }
                />
              </div>
            ))}

            {isSomeoneTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {!isAtBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="btn-icon absolute right-4 bottom-4 z-10 border-accent/30 bg-surface-2/90 text-accent shadow-lift backdrop-blur"
            aria-label={t("scrollToBottom")}
          >
            <IoChevronDown size={18} />
          </button>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background/92 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between gap-3 px-4 pt-2 md:px-8">
            <span className="status-line truncate">
              <IoTimeOutline size={12} className="shrink-0" />
              <span className="truncate">{t("expireNotice")}</span>
            </span>
            <span className="hidden font-mono text-[0.55rem] tracking-[0.18em] text-text-faint uppercase sm:block">
              {t("ephemeralLabel")}
            </span>
          </div>

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
      </div>
    </section>
  );
}
