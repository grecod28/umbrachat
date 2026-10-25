"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Message } from "./types";
import { formatFileSize } from "./types";
import { formatDate } from "@/libs/functions/format-date";
import { API_URL } from "@/libs/constants/api";
import { IoDocumentOutline, IoDownloadOutline } from "react-icons/io5";

function isImage(mimeType?: string) {
  return mimeType?.startsWith("image/") ?? false;
}

function isVideo(mimeType?: string) {
  return mimeType?.startsWith("video/") ?? false;
}

function useIsOwnMessage(message: Message) {
  return useMemo(() => {
    if (!message.id || !message.roomId) return false;
    const ownIds: string[] = JSON.parse(
      localStorage.getItem(`own-msgs:${message.roomId}`) || "[]",
    );
    return ownIds.includes(message.id);
  }, [message.id, message.roomId]);
}

function FilePreview({
  message,
  onDownload,
}: {
  message: Message;
  onDownload: () => void;
}) {
  const isMedia =
    isImage(message.mimeType) || isVideo(message.mimeType);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const key = message.key;
    if (!isMedia || !key) return;

    let cancelled = false;

    (async () => {
      try {
        const url = new URL(`${API_URL}/files/download-url`);
        url.searchParams.set("key", key);

        const res = await fetch(url.toString());
        const { url: presignedUrl } = await res.json();

        const blob = await fetch(presignedUrl).then((response) =>
          response.blob(),
        );
        if (!cancelled) {
          setObjectUrl(URL.createObjectURL(blob));
        }
      } catch {
        // fall back to the document view
      }
    })();

    return () => {
      cancelled = true;
      setObjectUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
    };
  }, [message.key, isMedia]);

  if (isImage(message.mimeType) && objectUrl) {
    return (
      <button
        type="button"
        className="group relative block max-w-full cursor-pointer overflow-hidden rounded-lg"
        onClick={onDownload}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={objectUrl}
          alt={message.fileName ?? ""}
          className="max-h-72 max-w-full rounded-lg object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
          <IoDownloadOutline
            size={22}
            className="text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100"
          />
        </span>
      </button>
    );
  }

  if (isVideo(message.mimeType) && objectUrl) {
    return (
      <div className="relative max-w-full">
        <video
          src={objectUrl}
          className="max-h-72 max-w-full rounded-lg"
          controls
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      className="flex max-w-72 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-accent">
        <IoDocumentOutline size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] text-text">
          {message.fileName}
        </span>
        <span className="mt-0.5 block font-mono text-[0.58rem] text-text-faint">
          {message.size != null && formatFileSize(message.size)}
        </span>
      </span>
      <IoDownloadOutline size={15} className="shrink-0 text-text-muted" />
    </button>
  );
}

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const parts: ReactNode[] = [];
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  let last = 0;

  for (let index = 0; index < text.length; ) {
    const found = lower.indexOf(needle, index);
    if (found === -1) {
      parts.push(text.slice(last));
      break;
    }
    if (found > last) parts.push(text.slice(last, found));
    parts.push(
      <mark
        key={found}
        className="rounded-[2px] bg-accent/30 px-0.5 text-text"
      >
        {text.slice(found, found + needle.length)}
      </mark>,
    );
    index = found + needle.length;
    last = index;
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function TextBubble({
  content,
  highlight,
  isActive,
}: {
  content: string;
  highlight?: string;
  isActive?: boolean;
}) {
  return (
    <p
      className={`text-[0.9rem] leading-relaxed break-words text-text ${
        isActive
          ? "-mx-1 rounded bg-accent/10 px-1 ring-1 ring-accent/30"
          : ""
      }`}
    >
      {highlight ? highlightText(content, highlight) : content}
    </p>
  );
}

function ShadowAvatar() {
  return (
    <span
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2"
      aria-hidden="true"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 shadow-[0_0_10px_var(--primary)]" />
    </span>
  );
}

export function MessageBubble({
  message,
  searchHighlight,
  isSearchActive,
}: {
  message: Message;
  searchHighlight?: string;
  isSearchActive?: boolean;
}) {
  const isOwn = useIsOwnMessage(message);
  const isFile = !message.content;

  const handleDownload = useCallback(async () => {
    const key = message.key;
    if (!key) return;

    try {
      const url = new URL(`${API_URL}/files/download-url`);
      url.searchParams.set("key", key);

      const res = await fetch(url.toString());
      const { url: presignedUrl } = await res.json();

      const blob = await fetch(presignedUrl).then((response) =>
        response.blob(),
      );
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = message.fileName ?? "";
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }, [message.key, message.fileName]);

  return (
    <div
      className={`flex items-start gap-2.5 ${
        isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {!isOwn && <ShadowAvatar />}

      <div
        className={`flex min-w-0 max-w-[min(42rem,86%)] flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`overflow-hidden rounded-2xl border ${
            isFile ? "" : "px-3.5 py-2.5"
          } ${
            isOwn
              ? "rounded-br-md border-primary/30 bg-primary/15"
              : "rounded-bl-md border-border bg-surface/90"
          }`}
        >
          {message.content ? (
            <TextBubble
              content={message.content}
              highlight={searchHighlight}
              isActive={isSearchActive}
            />
          ) : (
            <FilePreview message={message} onDownload={handleDownload} />
          )}
        </div>
        <p
          className={`mt-1 font-mono text-[0.56rem] tracking-[0.08em] text-text-faint ${
            isOwn ? "mr-1" : "ml-1"
          }`}
        >
          {formatDate(message.createdAt, "time")}
        </p>
      </div>
    </div>
  );
}
