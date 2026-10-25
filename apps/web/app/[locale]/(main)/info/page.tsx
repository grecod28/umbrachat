import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeading } from "@/components/layout/page-heading";
import { Eclipse } from "@/components/brand/eclipse";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  IoAddCircleOutline,
  IoArrowForward,
  IoChatbubblesOutline,
  IoColorPaletteOutline,
  IoGlobeOutline,
  IoHardwareChipOutline,
  IoLanguageOutline,
  IoLockClosedOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5";

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

export default async function InfoPage() {
  const t = await getTranslations("Info");
  const home = await getTranslations("Home");

  const sections = [
    {
      icon: IoAddCircleOutline,
      title: t("createRoom"),
      description: t("createRoomDesc"),
    },
    {
      icon: IoSearchOutline,
      title: t("searchRooms"),
      description: t("searchRoomsDesc"),
    },
    {
      icon: IoChatbubblesOutline,
      title: t("realTimeChat"),
      description: t("realTimeChatDesc"),
    },
    {
      icon: IoLockClosedOutline,
      title: t("privateRooms"),
      description: t("privateRoomsDesc"),
    },
    {
      icon: IoGlobeOutline,
      title: t("joinRoom"),
      description: t("joinRoomDesc"),
    },
    {
      icon: IoColorPaletteOutline,
      title: t("customization"),
      description: t("customizationDesc"),
    },
    {
      icon: IoLanguageOutline,
      title: t("language"),
      description: t("languageDesc"),
    },
    {
      icon: IoHardwareChipOutline,
      title: t("chatHistory"),
      description: t("chatHistoryDesc"),
    },
  ];

  return (
    <main className="overflow-hidden">
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="hero-glow" />
        <Eclipse className="pointer-events-none absolute top-1/2 right-[-10rem] h-[30rem] w-[30rem] -translate-y-1/2 text-primary/25" />

        <div className="page-shell relative py-14 md:py-20">
          <PageHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
            actions={
              <>
                <Link href="/chat/create" className="btn btn-primary">
                  {home("createRoom")}
                  <IoArrowForward size={17} />
                </Link>
                <Link href="/chat/search" className="btn btn-secondary">
                  {home("searchRoom")}
                </Link>
              </>
            }
          />
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mono-label">{t("filesLabel")}</p>
            <h2 className="display mt-4 max-w-2xl text-4xl text-text md:text-5xl">
              {t("sectionFeatures")}
            </h2>
          </div>
          <span className="mono-label">{t("eyebrow")}</span>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {sections.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal key={title} delay={index * 45}>
              <article className="panel panel-lift h-full p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.55rem] tracking-[0.18em] text-text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-[0.95rem] font-semibold text-text">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-text-muted">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/20">
        <div className="page-shell py-16 md:py-24">
          <div className="panel corner-frame relative overflow-hidden p-8 md:p-12">
            <Eclipse className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 text-accent/20" />
            <div className="relative z-10 max-w-xl">
              <p className="eyebrow">{t("sectionSteps")}</p>
              <h2 className="display mt-4 text-4xl text-text md:text-5xl">
                {t("cta")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                {t("ctaDesc")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/chat/create" className="btn btn-accent">
                  {home("createRoom")}
                  <IoArrowForward size={17} />
                </Link>
                <Link href="/chat/search" className="btn btn-secondary">
                  {home("searchRoom")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
          <span className="status-line">
            <span className="status-dot" />
            {t("ephemeralLabel")}
          </span>
          <span className="mono-label flex items-center gap-2">
            <IoShieldCheckmarkOutline size={13} className="text-accent" />
            {t("noAccountsLabel")}
          </span>
          <span className="mono-label flex items-center gap-2">
            <IoTimeOutline size={13} className="text-accent" />
            {t("vanishLabel")}
          </span>
        </div>
      </section>
    </main>
  );
}
