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
    // Favorites live in localStorage; sync after mount.
    const favorites = loadFavorites();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFav(favorites.includes(roomId));
  }, [roomId]);

  const toggleFavorite = useCallback(() => {
    const favorites = loadFavorites();
    const next = favorites.includes(roomId)
      ? favorites.filter((id) => id !== roomId)
      : [...favorites, roomId];
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
        trigger={
          <button
            type="button"
            className="btn-icon"
            title={t("settings")}
            aria-label={t("settings")}
          >
            <IoEllipsisVertical size={18} />
          </button>
        }
      >
        <div className="p-1">
          <Link href="/chat/default">
            <div className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-2">
              <IoCloseOutline size={17} className="shrink-0 text-accent" />
              <span>{t("closeChat")}</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleFavorite}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-2"
          >
            {isFav ? (
              <IoStar size={17} className="shrink-0 text-accent" />
            ) : (
              <IoStarOutline size={17} className="shrink-0 text-accent" />
            )}
            <span>{isFav ? t("removeFavorite") : t("addFavorite")}</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <IoTrashOutline size={17} className="shrink-0" />
            <span>{t("deleteChat")}</span>
          </button>
        </div>
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
