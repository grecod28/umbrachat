import type { Message } from "./types";
import { formatFileSize } from "./types";
import { formatDate } from "@/libs/functions/format-date";
import { IoDocumentOutline } from "react-icons/io5";

export function MessageBubble({ message }: { message: Message }) {
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
            <div className="flex items-center gap-2">
              <IoDocumentOutline size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-text truncate">
                  {message.fileName}
                </p>
                <p className="text-[10px] text-text-muted">
                  {message.size != null && formatFileSize(message.size)}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-[10px] text-text-muted mt-1 ml-1">
          {formatDate(message.createdAt, "time")}
        </p>
      </div>
    </div>
  );
}
