import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-8 px-4">
      <article className="animate-fade-in flex flex-col items-center gap-6">
        <Image
          src="/images/favicon-512.png"
          alt="UmbraChat Logo"
          width={120}
          height={120}
          className="animate-float drop-shadow-(--shadow-primary)"
          priority
        />

        <section className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("welcome")} <span className="text-primary">UmbraChat</span>
          </h1>
          <p className="text-text-muted max-w-md text-lg">
            {t("description")}
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 w-full">
          <Link
            href="/chat/create"
            className="px-6 py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-primary transition-shadow text-center"
          >
            {t("createRoom")}
          </Link>
          <Link
            href="/chat/join"
            className="px-6 py-3 rounded-xl border border-border-strong bg-surface font-semibold hover:bg-surface-light transition-colors text-center"
          >
            {t("joinRoom")}
          </Link>
        </section>
      </article>
    </main>
  );
}
