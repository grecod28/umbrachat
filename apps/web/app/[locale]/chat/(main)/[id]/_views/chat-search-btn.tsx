"use client";

import { IoSearchOutline } from "react-icons/io5";

export function ChatSearchBtn() {
  return (
    <button
      type="button"
      title="Search messages"
      onClick={() => window.dispatchEvent(new CustomEvent("toggle-chat-search"))}
      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
    >
      <IoSearchOutline size={20} />
    </button>
  );
}
