"use client";

import { useTranslations } from "next-intl";
import { IoSearchSharp } from "react-icons/io5";

export function ChatSearchBtn() {
  const t = useTranslations("ChatRoom");

  return (
    <button
      type="button"
      title={t("searchMessages")}
      aria-label={t("searchMessages")}
      onClick={() => window.dispatchEvent(new CustomEvent("toggle-chat-search"))}
      className="btn-icon"
    >
      <IoSearchSharp size={17} />
    </button>
  );
}
