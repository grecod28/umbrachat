"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

type Props = {
  totalPages: number;
};

export function Pagination({ totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = Math.min(
    Math.max(1, parseInt(searchParams.get("page") || "1", 10)),
    totalPages,
  );

  const goTo = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === current) return;

      const params = new URLSearchParams(searchParams.toString());

      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    },
    [current, totalPages, searchParams, pathname, router],
  );

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  for (
    let index = Math.max(2, current - 1);
    index <= Math.min(totalPages - 1, current + 1);
    index++
  ) {
    pages.push(index);
  }

  if (current < totalPages - 2) pages.push("...");

  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => goTo(current - 1)}
        disabled={current <= 1}
        className="btn-icon h-9 w-9"
        aria-label="Previous page"
      >
        <IoChevronBack size={16} />
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1.5 font-mono text-xs text-text-faint select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-current={page === current ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-mono text-xs transition-colors ${
              page === current
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goTo(current + 1)}
        disabled={current >= totalPages}
        className="btn-icon h-9 w-9"
        aria-label="Next page"
      >
        <IoChevronForward size={16} />
      </button>
    </nav>
  );
}
