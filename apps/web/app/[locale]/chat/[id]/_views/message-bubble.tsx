"use client";

import { useCallback } from "react";
import type { Message } from "./types";
import { formatFileSize } from "./types";
import { formatDate } from "@/libs/functions/format-date";
import { API_URL } from "@/libs/constants/api";
import { IoDocumentOutline, IoDownloadOutline } from "react-icons/io5";

export function MessageBubble({ message }: { message: Message }) {
  const handleDownload = useCallback(async () => {
    if (!message.key) return;

    try {
      const url = new URL(`${API_URL}/files/download-url`);
      url.searchParams.set("key", message.key);

      const res = await fetch(url.toString());
      const { url: presignedUrl } = await res.json();

      const a = document.createElement("a");
      a.href = presignedUrl;
      a.download = message.fileName ?? "";
      a.target = "_blank";
      a.click();
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  }, [message.key, message.fileName]);

  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 mt-1 rounded-full bg-linear-to-br from-primary/30 to-accent/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary/70">?</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-surface border border-border px-3 py-2">
          {message.content ? (
            <p className="text-sm text-text leading-relaxed wrap-break-words">
              {message.content}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 w-full text-left cursor-pointer hover:opacity-80 transition-opacity"
            >
              <IoDocumentOutline size={18} className="text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text truncate">
                  {message.fileName}
                </p>
                <p className="text-[10px] text-text-muted">
                  {message.size != null && formatFileSize(message.size)}
                </p>
              </div>
              <IoDownloadOutline size={16} className="text-text-muted shrink-0" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-text-muted mt-1 ml-1">
          {formatDate(message.createdAt, "time")}
        </p>
      </div>
    </div>
  );
}
