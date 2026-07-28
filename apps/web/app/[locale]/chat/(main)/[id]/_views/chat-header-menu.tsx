"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IoEllipsisVertical,
  IoSearchOutline,
  IoSettingsOutline,
  IoGlobeOutline,
} from "react-icons/io5";
import { LuMessageSquarePlus } from "react-icons/lu";
import { Dropdown } from "@/components/ui/dropdown";
import type { IconType } from "react-icons";

interface MenuItem {
  key: string;
  icon: IconType;
  href: string;
  external?: boolean;
}

const menuItems: MenuItem[] = [
  { key: "createNew", icon: LuMessageSquarePlus, href: "/chat/create" },
  { key: "searchRoom", icon: IoSearchOutline, href: "/chat/search" },
  { key: "settings", icon: IoSettingsOutline, href: "/config" },
  {
    key: "goToWebsite",
    icon: IoGlobeOutline,
    href: "https://umbrachat.org",
    external: true,
  },
];

export function ChatHeaderMenu() {
  const t = useTranslations("ChatRoom");

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          type="button"
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
          title={t("settings")}
        >
          <IoEllipsisVertical size={20} />
        </button>
      }
    >
      {menuItems.map(({ key, icon: Icon, href, external }) => {
        const content = (
          <div className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text transition-colors hover:bg-primary/10 cursor-pointer">
            <Icon size={18} className="shrink-0 text-primary" />
            <span>{t(key)}</span>
          </div>
        );

        if (external) {
          return (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          );
        }

        return (
          <Link key={key} href={href}>
            {content}
          </Link>
        );
      })}
    </Dropdown>
  );
}
