import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { ChatSidebar } from "./_views/chat-sidebar";
import { DesktopOnly } from "@/components/ui/desktop-only";
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
      {id === "default" ? (
        <ChatSidebar />
      ) : (
        <DesktopOnly>
          <ChatSidebar />
        </DesktopOnly>
      )}

      <div className="flex-1 min-w-0 flex flex-col relative">
        {id === "default" ? (
          <section className="hid lg:flex h-full flex-col items-center justify-center px-4 text-center">
            <h1>Chat</h1>
          </section>
        ) : (
          <>
            <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Link
                  href="/chat/default"
                  className="lg:hidden -ml-1.5 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <IoArrowBack size={22} />
                </Link>

                <h1 className="max-w-50 truncate text-sm font-semibold text-text">
                  {data.name || t("noTitle")}
                </h1>
              </div>

              <Link
                href={`/chat/${id}/share`}
                className="flex items-center gap-1.5 -mr-1.5 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-primary"
                title={t("share")}
              >
                <span className="hidden text-xs font-medium md:inline">
                  {t("share")}
                </span>
                <IoShareSocial size={18} />
              </Link>
            </header>

            <div className="h-12.25 shrink-0" />

            <div className="min-h-0 flex-1">
              <Chat initMessages={messagesData} roomId={id} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
