import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { ChatSidebar } from "./_views/chat-sidebar";
import { getTranslations } from "next-intl/server";
import { API_URL } from "@/libs/constants/api";

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
  const res = await fetch(`${API_URL}/rooms/${id}`);
  const data = await res.json();

  if (data.isPrivate) {
    return <AccessRoom data={data} roomId={id} />;
  }

  const messagesRes = await fetch(`${API_URL}/rooms/${id}/messages`);
  const messagesData = await messagesRes.json();

  return (
    <main className="h-screen flex">
      <ChatSidebar />

      <div className="flex-1 min-w-0 flex flex-col relative">
        <header className="absolute top-0 left-0 w-full z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
            >
              <IoArrowBack size={22} />
            </Link>
            <h1 className="text-sm font-semibold text-text truncate max-w-50">
              {data.name || t("noTitle")}
            </h1>
          </div>

          <Link
            href={`/chat/${id}/share`}
            className="flex items-center gap-1.5 p-1.5 -mr-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface transition-colors"
            title={t("share")}
          >
            <span className="hidden md:inline text-xs font-medium">
              {t("share")}
            </span>
            <IoShareSocial size={18} />
          </Link>
        </header>

        <div className="shrink-0 h-12.25" />

        <div className="flex-1 min-h-0">
          <Chat initMessages={messagesData} roomId={id} />
        </div>
      </div>
    </main>
  );
}
