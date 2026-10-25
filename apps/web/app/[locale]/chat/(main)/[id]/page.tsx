import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { IoArrowBack, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { ChatRoomHeader } from "./_views/chat-room-header";
import { ChatWelcome } from "./_views/welcome";
import { API_URL } from "@/libs/constants/api";
import type { Message } from "./_views/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("chatRoom.title"),
    description: t("chatRoom.description"),
  };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("ChatRoom");
  const nav = await getTranslations("ChatLayout");

  if (id === "default") {
    return (
      <main className="flex h-full min-h-0 w-full flex-col">
        <ChatWelcome />
      </main>
    );
  }

  let data: {
    id: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
  } | null = null;

  try {
    const res = await fetch(`${API_URL}/rooms/${id}`, { cache: "no-store" });
    if (res.ok) data = await res.json();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <main className="flex h-full min-h-0 w-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="panel corner-frame w-full max-w-md p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-text-muted">
            <IoChatbubbleEllipsesOutline size={22} />
          </span>
          <h1 className="display mt-5 text-3xl text-text">{t("roomNotFound")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {t("roomNotFoundDesc")}
          </p>
          <Link
            href="/chat/default"
            className="btn btn-secondary mt-6 inline-flex"
          >
            <IoArrowBack size={17} />
            {nav("back")}
          </Link>
        </div>
      </main>
    );
  }

  if (data.isPrivate) {
    return <AccessRoom data={data} roomId={id} />;
  }

  let messages: Message[] = [];
  try {
    const messagesRes = await fetch(`${API_URL}/rooms/${id}/messages`, {
      cache: "no-store",
    });
    if (messagesRes.ok) messages = await messagesRes.json();
  } catch {
    messages = [];
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-col" id="chat-container">
      <ChatRoomHeader
        roomId={id}
        name={data.name}
        description={data.description}
        isPrivate={data.isPrivate}
      />
      <div className="min-h-0 flex-1">
        <Chat initMessages={messages} roomId={id} />
      </div>
    </main>
  );
}
