import { Link } from "@/i18n/navigation";
import { formatDate } from "@/libs/functions/format-date";

type ChatCardProps = {
  id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
  lastMessageAt?: string | Date;
  noTitleLabel?: string;
};

export function ChatCard({
  id,
  name,
  description,
  createdAt,
  lastMessageAt,
  noTitleLabel = "Untitled Chat",
}: ChatCardProps) {
  return (
    <Link
      href={`/chat/${id}`}
      className="block p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
    >
      <p className="font-medium text-text">{name || noTitleLabel}</p>

      {description && (
        <p className="text-sm text-text-muted mt-1 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
        <span>{formatDate(createdAt)}</span>
        {lastMessageAt && (
          <>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <span>{formatDate(lastMessageAt, "time")}</span>
          </>
        )}
      </div>
    </Link>
  );
}
