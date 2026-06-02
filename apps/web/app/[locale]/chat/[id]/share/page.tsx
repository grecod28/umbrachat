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

export default function ShareChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("ShareChat");
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => setIsPrivate(data.isPrivate))
      .catch(() => {});
  }, [id]);

  const shareLink =
    typeof window !== "undefined" ? `${window.location.origin}/chat/${id}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "UmbraChat",
        url: shareLink,
      });
    }
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </div>

        {isPrivate && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
            <IoLockClosed className="shrink-0 mt-0.5 text-primary" size={18} />
            <p className="text-sm text-text-muted">{t("privateNotice")}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            title="link-input"
            type="text"
            readOnly
            value={shareLink}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-surface border border-border text-text text-sm font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shrink-0"
          >
            {copied ? (
              <>
                <IoCheckmark size={18} />
                <span className="text-sm">{t("copied")}</span>
              </>
            ) : (
              <>
                <IoCopy size={18} />
                <span className="text-sm">{t("copy")}</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border-strong bg-surface font-semibold text-text hover:bg-surface-light transition-colors"
        >
          <IoShareSocial size={18} />
          <span className="text-sm">{t("share")}</span>
        </button>

        <Link
          href={`/chat/${id}`}
          className="flex items-center justify-center gap-2 text-text-muted hover:text-text transition-colors"
        >
          <IoArrowBack size={18} />
          <span className="text-sm font-medium">{t("backToChat")}</span>
        </Link>
      </div>
    </main>
  );
}
