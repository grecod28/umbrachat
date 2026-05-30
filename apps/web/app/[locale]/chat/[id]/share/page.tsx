"use client";

import { useState, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoCopy, IoCheckmark } from "react-icons/io5";

export default function ShareChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("ShareChat");
  const [copied, setCopied] = useState(false);

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/chat/${id}`
      : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <div className="flex items-center gap-2">
          <input
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
