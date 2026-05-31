import { Link } from "@/i18n/navigation";
import { IoArrowBack, IoShareSocial } from "react-icons/io5";
import Chat from "./_views/chat";
import AccessRoom from "./_views/access-room";
import { getTranslations } from "next-intl/server";
import { API_URL } from "@/libs/constants/api";

const MOCK_MESSAGES = [
  {
    id: "1",
    sender: "Ana",
    text: "Hola a todos! Como van?",
    timestamp: "10:30",
    isOwn: false,
  },
  {
    id: "2",
    sender: "Tu",
    text: "Hey Ana! Todo bien por aqui, trabajando en el proyecto nuevo.",
    timestamp: "10:31",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Carlos",
    text: "Yo tambien ando metido en eso, esta quedando genial",
    timestamp: "10:33",
    isOwn: false,
  },
  {
    id: "4",
    sender: "Tu",
    text: "Si! La parte del chat en tiempo real quedo muy fluida",
    timestamp: "10:34",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Ana",
    text: "Me encanta el diseño, se ve super moderno",
    timestamp: "10:36",
    isOwn: false,
  },
  {
    id: "6",
    sender: "Carlos",
    text: "Cuando lo subimos a produccion?",
    timestamp: "10:37",
    isOwn: false,
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
