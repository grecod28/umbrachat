"use client";

import { useRouter } from "@/i18n/navigation";
import { IoArrowBack } from "react-icons/io5";

export function ConfigBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
    >
      <IoArrowBack size={16} />
      Back
    </button>
  );
}
