import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { ChatSearchBtn } from "./_views/chat-search-btn";
import { ChatRoomMenu } from "./_views/chat-room-menu";
import { getTranslations } from "next-intl/server";
import { API_URL } from "@/libs/constants/api";
import { LuMessageSquarePlus } from "react-icons/lu";
import Chip from "@/components/ui/chip";
import { IoMdSearch } from "react-icons/io";

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
    <main className="flex-1 w-full">
      <div className="h-screen min-w-0 flex flex-col relative" id="chat-container">
        {id === "default" ? (
          <section className="hidden lg:flex h-full items-center justify-center gap-6 px-4 text-center">
            <Link
              href="/chat/create"
              className="flex flex-col items-center p-2 text-text-muted"
            >
              <Chip className="rounded-2xl py-3! px-4! mb-2">
                <LuMessageSquarePlus size={24} />
              </Chip>

              <p className="text-sm font-medium">{t("createNew")}</p>
            </Link>

            <Link
              href="/chat/search"
              className="flex flex-col items-center  p-2 text-text-muted"
            >
              <Chip className="rounded-2xl py-3! px-4! mb-2" active>
                <IoMdSearch size={24} />
              </Chip>

              <p className="text-sm font-medium">{t("searchRoom")}</p>
            </Link>
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

              <div className="flex items-center gap-4">
                <ChatSearchBtn />

                <Link
                  href={`/chat/${id}/share`}
                  className="flex items-center gap-1.5 -mr-1.5 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-primary"
                  title={t("share")}
                >
                  <IoShareSocial size={18} />
                </Link>

                <ChatRoomMenu roomId={id} />
              </div>
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
