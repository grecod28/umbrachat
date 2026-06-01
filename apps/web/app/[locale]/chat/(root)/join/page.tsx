"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function JoinChatPage() {
  const [link, setLink] = useState("");
  const t = useTranslations("JoinChat");

  const handleJoin = () => {
    console.log("Joining room:", link);
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

        <div className="flex">
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={t("linkPlaceholder")}
            className="flex-1 min-w-0 px-4 py-3 rounded-l-xl bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <button
            onClick={handleJoin}
            className="px-6 py-3 rounded-r-xl text-white font-semibold shadow-primary transition-shadow whitespace-nowrap bg-primary"
          >
            {t("submit")}
          </button>
        </div>
      </div>
    </main>
  );
}
