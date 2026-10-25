"use client";

import { useState, use, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoCopy,
  IoCheckmark,
  IoLockClosed,
  IoShareSocial,
} from "react-icons/io5";
import { API_URL } from "@/libs/constants/api";
import { PageHeading } from "@/components/layout/page-heading";
import { Eclipse } from "@/components/brand/eclipse";

export default function ShareChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("ShareChat");
  const chat = useTranslations("ChatRoom");
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only data after hydration
    setShareLink(`${window.location.origin}/chat/${id}`);

    fetch(`${API_URL}/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setIsPrivate(Boolean(data.isPrivate));
        setRoomName(data.name || "");
      })
      .catch(() => {});
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: roomName || "UmbraChat",
        url: shareLink,
      });
      return;
    }
    await handleCopy();
  };

  return (
    <main className="relative h-full overflow-y-auto">
      <div className="dossier-grid pointer-events-none absolute inset-0" />
      <Eclipse className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 text-primary/20" />

      <div className="relative mx-auto flex min-h-full w-full max-w-xl flex-col justify-center px-4 py-7 md:px-8 md:py-10">
        <Link
          href={`/chat/${id}`}
          className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-text-muted uppercase transition-colors hover:text-accent"
        >
          <IoArrowBack size={15} />
          {t("backToChat")}
        </Link>

        <PageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="panel corner-frame mt-8 p-5 md:p-6">
          <p className="mono-label text-text-faint">
            {roomName || chat("noTitle")}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              title="link-input"
              type="text"
              readOnly
              value={shareLink}
              placeholder="—"
              className="field min-w-0 flex-1 font-mono text-[0.72rem]"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-primary shrink-0"
            >
              {copied ? (
                <>
                  <IoCheckmark size={17} />
                  {t("copied")}
                </>
              ) : (
                <>
                  <IoCopy size={16} />
                  {t("copy")}
                </>
              )}
            </button>
          </div>

          <span className="sr-only" role="status" aria-live="polite">
            {copied ? t("copied") : ""}
          </span>

          {isPrivate && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/10 p-3.5">
              <IoLockClosed
                className="mt-0.5 shrink-0 text-accent"
                size={17}
              />
              <p className="text-xs leading-relaxed text-text-soft">
                {t("privateNotice")}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleNativeShare}
            className="btn btn-secondary mt-3 w-full"
          >
            <IoShareSocial size={17} />
            {t("share")}
          </button>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Link
              href={`/chat/${id}`}
              className="inline-flex items-center gap-2 text-xs text-text-muted transition-colors hover:text-text"
            >
              <IoArrowBack size={15} />
              {t("backToChat")}
            </Link>
            <span className="font-mono text-[0.55rem] tracking-[0.16em] text-text-faint uppercase">
              {t("ephemeral")}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
