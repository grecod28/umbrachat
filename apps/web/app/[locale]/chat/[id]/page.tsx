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
    <main className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
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
          href="/chat/1/share"
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors"
        >
          <span className="text-xs font-medium">{t("share")}</span>
          <IoShareSocial size={18} />
        </Link>
      </header>

      <Chat initMessages={messagesData} roomId={id} />
    </main>
  );
}
