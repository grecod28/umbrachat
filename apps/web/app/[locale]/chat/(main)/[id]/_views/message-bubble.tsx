"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Message } from "./types";
import { formatFileSize } from "./types";
import { formatDate } from "@/libs/functions/format-date";
import { API_URL } from "@/libs/constants/api";
import {
  IoDocumentOutline,
  IoDownloadOutline,
} from "react-icons/io5";

function isImage(mimeType?: string) {
  return mimeType?.startsWith("image/") ?? false;
}

function isVideo(mimeType?: string) {
  return mimeType?.startsWith("video/") ?? false;
}

function useIsOwnMessage(message: Message) {
  return useMemo(() => {
    if (!message.id || !message.roomId) return false;
    const key = `own-msgs:${message.roomId}`;
    const ownIds: string[] = JSON.parse(localStorage.getItem(key) || "[]");
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
  const isMedia = isImage(message.mimeType) || isVideo(message.mimeType);
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

        const blob = await fetch(presignedUrl).then((r) => r.blob());
        if (!cancelled) {
          setObjectUrl(URL.createObjectURL(blob));
        }
      } catch {
        // fallback to icon view
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.key, isMedia]);

  if (isImage(message.mimeType) && objectUrl) {
    return (
      <div className="relative group cursor-pointer" onClick={onDownload}>
        <img
          src={objectUrl}
          alt={message.fileName ?? ""}
          className="max-w-64 max-h-64 rounded-lg object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
          <IoDownloadOutline
            size={22}
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
          />
        </div>
      </div>
    );
  }

  if (isVideo(message.mimeType) && objectUrl) {
    return (
      <div className="relative group cursor-pointer" onClick={onDownload}>
        <video
          src={objectUrl}
          className="max-w-64 max-h-64 rounded-lg"
          controls
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <IoDownloadOutline size={18} className="text-white drop-shadow-lg" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity px-3 py-2 max-w-64"
    >
      <IoDocumentOutline size={18} className="text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text truncate">{message.fileName}</p>
        <p className="text-[10px] text-text-muted">
          {message.size != null && formatFileSize(message.size)}
        </p>
      </div>
      <IoDownloadOutline size={16} className="text-text-muted shrink-0" />
    </button>
  );
}

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-400/30 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
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
      className={`text-sm text-text leading-relaxed break-words ${
        isActive ? "bg-amber-400/15 -mx-1 px-1 rounded" : ""
      }`}
    >
      {highlight ? highlightText(content, highlight) : content}
    </p>
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

      const blob = await fetch(presignedUrl).then((r) => r.blob());
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = message.fileName ?? "";
      a.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  }, [message.key, message.fileName]);

  return (
    <div className={`flex items-start gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && (
        <div className="shrink-0 w-8 h-8 mt-1 rounded-full bg-linear-to-br from-primary/30 to-accent/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary/70">?</span>
        </div>
      )}

      <div className="max-w-[720px] min-w-0">
        <div
          className={`rounded-xl border border-border overflow-hidden ${isFile ? "" : "px-3 py-2"} ${
            isOwn ? "bg-primary/15 border-primary/20" : "bg-surface"
          }`}
        >
          {message.content ? (
            <TextBubble content={message.content} highlight={searchHighlight} isActive={isSearchActive} />
          ) : (
            <FilePreview message={message} onDownload={handleDownload} />
          )}
        </div>
        <p
          className={`text-[10px] text-text-muted mt-1 ${
            isOwn ? "text-right mr-1" : "ml-1"
          }`}
        >
          {formatDate(message.createdAt, "time")}
        </p>
      </div>
    </div>
  );
}
