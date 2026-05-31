import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { getTranslations } from "next-intl/server";
import { API_URL } from "@/libs/constants/api";

const MOCK_MESSAGES = [
  {
    id: "1",
    content: "Hola a todos! Como van?",
    createdAt: "2026-05-31T10:30:00.000Z",
  },
  {
    id: "2",
    content: "Hey! Todo bien por aqui, trabajando en el proyecto nuevo.",
    createdAt: "2026-05-31T10:31:00.000Z",
  },
  {
    id: "3",
    content: "Yo tambien ando metido en eso, esta quedando genial",
    createdAt: "2026-05-31T10:33:00.000Z",
  },
  {
    id: "4",
    content: "Si! La parte del chat en tiempo real quedo muy fluida",
    createdAt: "2026-05-31T10:34:00.000Z",
  },
  {
    id: "5",
    content: "Me encanta el diseño, se ve super moderno",
    createdAt: "2026-05-31T10:36:00.000Z",
  },
  {
    id: "6",
    content: "Cuando lo subimos a produccion?",
    createdAt: "2026-05-31T10:37:00.000Z",
  },
];
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
    return <AccessRoom roomId={id} />;
  }

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

      <Chat initMessages={MOCK_MESSAGES} />
    </main>
  );
}
