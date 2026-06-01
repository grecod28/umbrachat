import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { getTranslations } from "next-intl/server";
import { API_URL } from "@/libs/constants/api";

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
          href={`/chat/${id}/share`}
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors"
        >
          <span className="text-xs font-medium">{t("share")}</span>
          <IoShareSocial size={18} />
        </Link>
      </header>

      <div className="shrink-0 h-[49px]" />

      <div className="flex-1 min-h-0">
        <Chat initMessages={messagesData} roomId={id} />
      </div>
    </main>
  );
}
