import type { Message } from "./types";
import { formatDate } from "@/libs/functions/format-date";

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 mt-1 rounded-full bg-linear-to-br from-primary/30 to-accent/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary/70">?</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-surface border border-border px-3 py-2">
          <p className="text-sm text-text leading-relaxed wrap-break-words">
            {message.content}
          </p>
        </div>
        <p className="text-[10px] text-text-muted mt-1 ml-1">
          {formatDate(message.createdAt, "time")}
        </p>
      </div>
    </div>
  );
}
