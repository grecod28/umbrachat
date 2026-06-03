import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  IoAddCircle,
  IoEnter,
  IoChatbubbles,
  IoLockClosed,
  IoSearch,
  IoColorPalette,
  IoLanguage,
  IoTime,
} from "react-icons/io5";

const features = [
  { key: "createRoom", icon: IoAddCircle },
  { key: "joinRoom", icon: IoEnter },
  { key: "realTimeChat", icon: IoChatbubbles },
  { key: "privateRooms", icon: IoLockClosed },
  { key: "searchRooms", icon: IoSearch },
  { key: "customization", icon: IoColorPalette },
  { key: "language", icon: IoLanguage },
  { key: "chatHistory", icon: IoTime },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("info.title"),
    description: t("info.description"),
  };
}

export default async function HelpPage() {
  const t = await getTranslations("Info");

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 pb-4 px-4">
      <section className="animate-fade-in w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="shrink-0 mt-0.5 text-primary" size={22} />
                <div className="space-y-1">
                  <h2 className="font-semibold text-text">{t(`${key}`)}</h2>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`${key}Desc`)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
