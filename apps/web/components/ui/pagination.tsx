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

  const pages: (number | "...")[] = [];

  pages.push(1);

  if (current > 3) pages.push("...");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(totalPages - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < totalPages - 2) pages.push("...");

  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav className="flex items-center justify-center gap-2">
      <button
        title="Previous page button"
        type="button"
        onClick={() => goTo(current - 1)}
        disabled={current <= 1}
        className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <IoChevronBack size={18} className="text-text" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-text-muted select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            className={`min-w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
              page === current
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text hover:bg-surface-light"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        title="Next page button"
        type="button"
        onClick={() => goTo(current + 1)}
        disabled={current >= totalPages}
        className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <IoChevronForward size={18} className="text-text" />
      </button>
    </nav>
  );
}
