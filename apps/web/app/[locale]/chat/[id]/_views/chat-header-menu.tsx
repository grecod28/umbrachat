"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IoEllipsisVertical,
  IoSearchOutline,
  IoSettingsOutline,
  IoGlobeOutline,
} from "react-icons/io5";
import { LuMessageSquarePlus } from "react-icons/lu";

import type { IconType } from "react-icons";

interface MenuItem {
  key: string;
  icon: IconType;
  href: string;
  external?: boolean;
}

const menuItems: MenuItem[] = [
  {
    key: "createNew",
    icon: LuMessageSquarePlus,
    href: "/chat/create",
  },
  {
    key: "searchRoom",
    icon: IoSearchOutline,
    href: "/search",
  },
  {
    key: "settings",
    icon: IoSettingsOutline,
    href: "/config",
  },
  {
    key: "goToWebsite",
    icon: IoGlobeOutline,
    href: "https://umbrachat.org",
    external: true,
  },
];

export function ChatHeaderMenu() {
  const t = useTranslations("ChatRoom");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-1.5 transition-colors hover:bg-surface hover:text-text"
        title={t("settings")}
      >
        <IoEllipsisVertical size={20} />
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-in max-lg:right-0 lg:left-0">
          {menuItems.map(({ key, icon: Icon, href, external = false }) => {
            const content = (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text transition-colors hover:bg-primary/10"
              >
                <Icon size={18} className="shrink-0 text-primary" />
                <span>{t(key)}</span>
              </button>
            );

            if (external) {
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={key} href={href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
