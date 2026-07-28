"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  IoEllipsisVertical,
  IoCloseOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Dropdown } from "@/components/ui/dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const FAVS_KEY = "fav-rooms";

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(FAVS_KEY, JSON.stringify(ids));
}

export function ChatRoomMenu({ roomId }: { roomId: string }) {
  const t = useTranslations("ChatRoom");
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const favs = loadFavorites();
    setIsFav(favs.includes(roomId));
  }, [roomId]);

  const toggleFavorite = useCallback(() => {
    const favs = loadFavorites();
    const next = favs.includes(roomId)
      ? favs.filter((id) => id !== roomId)
      : [...favs, roomId];
    saveFavorites(next);
    setIsFav(next.includes(roomId));
    window.dispatchEvent(new Event("fav-rooms-changed"));
  }, [roomId]);

  const confirmDelete = useCallback(() => {
    const rooms: string[] = JSON.parse(localStorage.getItem("rooms") || "[]");
    const next = rooms.filter((id) => id !== roomId);
    localStorage.setItem("rooms", JSON.stringify(next));
    window.dispatchEvent(new Event("rooms-changed"));
    setDeleteOpen(false);
    router.push("/chat/default");
  }, [roomId, router]);

  return (
    <>
      <Dropdown
        align="right"
        className="max-lg:right-auto! max-lg:left-0 lg:right-0 lg:left-auto!"
        trigger={
          <button
            type="button"
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-text"
            title={t("settings")}
          >
            <IoEllipsisVertical size={20} />
          </button>
        }
      >
        <Link href="/chat/default">
          <div className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text transition-colors hover:bg-primary/10 cursor-pointer">
            <IoCloseOutline size={18} className="shrink-0 text-primary" />
            <span>{t("closeChat")}</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleFavorite}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text transition-colors hover:bg-primary/10 cursor-pointer"
        >
          {isFav ? (
            <IoStar size={18} className="shrink-0 text-primary" />
          ) : (
            <IoStarOutline size={18} className="shrink-0 text-primary" />
          )}
          <span>{isFav ? t("removeFavorite") : t("addFavorite")}</span>
        </button>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
        >
          <IoTrashOutline size={18} className="shrink-0" />
          <span>{t("deleteChat")}</span>
        </button>
      </Dropdown>

      <ConfirmDialog
        open={deleteOpen}
        title={t("deleteChatTitle")}
        description={t("deleteChatDesc")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
