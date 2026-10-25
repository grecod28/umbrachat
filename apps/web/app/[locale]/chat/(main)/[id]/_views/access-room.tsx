"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/libs/constants/api";
import { playSubmitSound } from "@/libs/functions/sounds";
import {
  IoArrowBack,
  IoLockClosed,
  IoKeyOutline,
} from "react-icons/io5";
import { InputPassword } from "@/components/ui/input-password";
import { Link } from "@/i18n/navigation";
import { Eclipse } from "@/components/brand/eclipse";
import Chat from "./chat";
import { ChatRoomHeader } from "./chat-room-header";

type Props = {
  roomId: string;
  data: {
    name: string;
    description?: string;
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
  const nav = useTranslations("ChatLayout");
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
      .then((messages) => {
        if (messages) {
          setStatus({
            granted: true,
            error: "",
            messages,
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
    formState: { errors, isSubmitting },
  } = useForm<AccessForm>({
    resolver: zodResolver(accessSchema),
  });

  const onSubmit = useCallback(
    async (formData: AccessForm) => {
      playSubmitSound();
      setStatus((prev) => ({ ...prev, error: "" }));

      const res = await fetch(`${API_URL}/rooms/${roomId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        const messages = await messagesRes.json();
        setStatus({
          granted: true,
          error: "",
          messages,
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
      <main className="flex h-full min-h-0 w-full flex-col">
        <ChatRoomHeader
          roomId={roomId}
          name={data.name}
          description={data.description}
          isPrivate
        />
        <div className="min-h-0 flex-1">
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
    <section className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="dossier-grid absolute inset-0" />
        <Eclipse className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-primary/30" />
      </div>

      <div className="panel corner-frame relative z-10 w-full max-w-md p-7 md:p-8">
        <Link
          href="/chat/default"
          className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-text-muted transition-colors hover:text-text"
        >
          <IoArrowBack size={15} />
          {nav("back")}
        </Link>

        <div className="mt-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <IoLockClosed size={20} />
          </span>
          <div className="min-w-0">
            <p className="mono-label text-accent">{t("privateRoom")}</p>
            <h1 className="truncate text-lg font-semibold text-text">
              {data.name || t("noTitle")}
            </h1>
          </div>
        </div>

        <p className="display mt-7 text-4xl leading-[0.95] text-text">
          {t("accessTitle")}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {t("accessDescription")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <InputPassword
            label={t("codeLabel")}
            placeholder={t("codePlaceholder")}
            maxLength={6}
            register={register("password", {
              setValueAs: (value: string) => value?.toUpperCase() ?? "",
            })}
            error={errors.password?.message}
          />

          {status.error && (
            <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-center text-xs text-danger">
              {status.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            <IoKeyOutline size={17} />
            {t("accessSubmit")}
          </button>
        </form>

        <p className="mono-label mt-6 text-center text-text-faint">
          {t("expireNotice")}
        </p>
      </div>
    </section>
  );
}
