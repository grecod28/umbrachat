"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/libs/constants/api";
import { IoArrowBack, IoLockClosed, IoShareSocial } from "react-icons/io5";
import Chat from "./chat";
import Link from "next/link";

type Props = {
  roomId: string;
  data: {
    name: string;
  };
};

type Status = {
  granted: boolean;
  error: string;
  messages: { id: string; content: string; createdAt: string }[];
  token: string | null;
};

export default function AccessRoom({ roomId, data }: Props) {
  const t = useTranslations("ChatRoom");
  const [status, setStatus] = useState<Status>({
    granted: false,
    error: "",
    messages: [],
    token: null,
  });

  useEffect(() => {
    const storedToken = sessionStorage.getItem(`room-token-${roomId}`);
    if (!storedToken) return;

    fetch(
      `${API_URL}/rooms/${roomId}/messages?token=${encodeURIComponent(storedToken)}`,
    )
      .then((res) => {
        if (!res.ok) {
          sessionStorage.removeItem(`room-token-${roomId}`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStatus({
            granted: true,
            error: "",
            messages: data,
            token: storedToken,
          });
        }
      })
      .catch(() => {});
  }, [roomId]);

  const accessSchema = z.object({
    password: z.string().length(6, t("codeError")),
  });

  type AccessForm = z.infer<typeof accessSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessForm>({
    resolver: zodResolver(accessSchema),
  });

  const onSubmit = useCallback(
    async (data: AccessForm) => {
      setStatus((prev) => ({ ...prev, error: "" }));

      const res = await fetch(`${API_URL}/rooms/${roomId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (!res.ok) {
        setStatus((prev) => ({ ...prev, error: t("wrongCode") }));
        return;
      }

      sessionStorage.setItem(`room-token-${roomId}`, resData.token);

      const messagesRes = await fetch(
        `${API_URL}/rooms/${roomId}/messages?token=${encodeURIComponent(resData.token)}`,
      );

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setStatus({
          granted: true,
          error: "",
          messages: messagesData,
          token: resData.token,
        });
      } else {
        setStatus((prev) => ({ ...prev, error: t("wrongCode") }));
      }
    },
    [roomId, t],
  );

  if (status.granted) {
    return (
      <main className="h-screen flex flex-col">
        <header className="fixed top-0 left-0 w-full z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <Link
            href="/chat"
            className="text-text-muted hover:text-text transition-colors"
          >
            <IoArrowBack size={22} />
          </Link>

          <h1 className="text-sm font-semibold text-text truncate max-w-50">
            {data.name || t("noTitle")}
          </h1>

          <Link
            href={`/chat/${roomId}/share`}
            className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors"
          >
            <span className="text-xs font-medium">{t("share")}</span>
            <IoShareSocial size={18} />
          </Link>
        </header>

        <div className="shrink-0 h-[49px]" />

        <div className="flex-1 min-h-0">
          <Chat
            token={status.token}
            initMessages={status.messages}
            roomId={roomId}
          />
        </div>
      </main>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <IoLockClosed className="mx-auto text-primary" size={40} />
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("accessTitle")}
          </h1>
          <p className="text-text-muted">{t("accessDescription")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium">
              {t("codeLabel")}
            </label>
            <input
              id="code"
              type="text"
              maxLength={6}
              placeholder={t("codePlaceholder")}
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors tracking-[0.3em] font-mono uppercase"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-danger">{errors.password.message}</p>
            )}
          </div>

          {status.error && (
            <p className="text-sm text-danger">{status.error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-primary transition-shadow hover:brightness-110"
          >
            {t("accessSubmit")}
          </button>
        </form>
      </div>
    </section>
  );
}
