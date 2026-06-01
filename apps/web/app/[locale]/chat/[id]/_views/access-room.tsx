"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/libs/constants/api";
import { IoLockClosed } from "react-icons/io5";
import Chat from "./chat";

type Props = {
  roomId: string;
};

export default function AccessRoom({ roomId }: Props) {
  const t = useTranslations("ChatRoom");
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      setToken(sessionStorage.getItem(`room-token-${roomId}`));

      if (!token) return;

      try {
        const res = await fetch(
          `${API_URL}/rooms/${roomId}/messages?token=${encodeURIComponent(token)}`,
        );

        if (!res.ok) {
          sessionStorage.removeItem(`room-token-${roomId}`);
          return;
        }

        const data = await res.json();
        console.log(data);

        setMessages(data);
        setGranted(true);
      } catch (error) {
        console.error(error);
      }
    };

    checkAccess();
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

  const onSubmit = async (data: AccessForm) => {
    setError("");

    const res = await fetch(`${API_URL}/rooms/${roomId}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    console.log(resData);

    if (!res.ok) {
      setError(t("wrongCode"));
      return;
    }

    sessionStorage.setItem(`room-token-${roomId}`, resData.token);

    const messagesRes = await fetch(
      `${API_URL}/rooms/${roomId}/messages?token=${encodeURIComponent(
        resData.token,
      )}`,
    );

    if (messagesRes.ok) {
      const messagesData = await messagesRes.json();
      setMessages(messagesData);
    }

    setGranted(true);
  };

  if (granted) {
    return <Chat token={token} initMessages={messages} roomId={roomId} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-primary transition-shadow hover:brightness-110"
          >
            {t("accessSubmit")}
          </button>
        </form>
      </div>
    </main>
  );
}
