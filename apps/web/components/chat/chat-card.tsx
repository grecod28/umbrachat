import { Link } from "@/i18n/navigation";
import { formatDate } from "@/libs/functions/format-date";
import {
  IoArrowForward,
  IoLockClosedOutline,
  IoGlobeOutline,
} from "react-icons/io5";

type ChatCardProps = {
  id: string;
  index?: number;
  name: string;
  description?: string;
  createdAt: string | Date;
  lastMessageAt?: string | Date;
  noTitleLabel?: string;
  isPrivate?: boolean;
};

export function ChatCard({
  id,
  index,
  name,
  description,
  createdAt,
  lastMessageAt,
  isPrivate = false,
  noTitleLabel = "Untitled Chat",
}: ChatCardProps) {
  return (
    <Link
      href={`/chat/${id}`}
      className="panel panel-lift group flex items-start gap-3.5 p-4 md:gap-4 md:p-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-text-muted">
        {isPrivate ? (
          <IoLockClosedOutline size={17} />
        ) : (
          <IoGlobeOutline size={17} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {index != null && (
            <span className="font-mono text-[0.56rem] tracking-[0.16em] text-text-faint">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
            {name || noTitleLabel}
          </span>
        </span>

        {description && (
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-text-muted">
            {description}
          </span>
        )}

        <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.56rem] tracking-[0.08em] text-text-faint">
          <span>{formatDate(createdAt, "date")}</span>
          {lastMessageAt && (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-text-faint" />
              <span>{formatDate(lastMessageAt, "time")}</span>
            </>
          )}
        </span>
      </span>

      <IoArrowForward
        size={16}
        className="mt-1 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </Link>
  );
}
