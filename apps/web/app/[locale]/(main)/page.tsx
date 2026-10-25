import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Eclipse } from "@/components/brand/eclipse";
import {
  IoShieldCheckmarkOutline,
  IoChatbubblesOutline,
  IoLockClosedOutline,
  IoDocumentOutline,
  IoAddCircleOutline,
  IoChatbubbleEllipsesOutline,
  IoEyeOffOutline,
  IoArrowForward,
  IoTimeOutline,
  IoFingerPrintOutline,
} from "react-icons/io5";

const features = [
  {
    icon: IoEyeOffOutline,
    key: "featureIncognito",
    descKey: "featureIncognitoDesc",
  },
  {
    icon: IoChatbubblesOutline,
    key: "featureRealtime",
    descKey: "featureRealtimeDesc",
  },
  {
    icon: IoLockClosedOutline,
    key: "featureRooms",
    descKey: "featureRoomsDesc",
  },
  {
    icon: IoDocumentOutline,
    key: "featureFiles",
    descKey: "featureFilesDesc",
  },
] as const;

const steps = [
  { icon: IoAddCircleOutline, titleKey: "step1Title", descKey: "step1Desc" },
  {
    icon: IoChatbubbleEllipsesOutline,
    titleKey: "step2Title",
    descKey: "step2Desc",
  },
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: "step3Title",
    descKey: "step3Desc",
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-glow" />
        <div className="hero-grid pointer-events-none absolute inset-0 -z-10" />

        <div className="page-shell grid gap-14 pt-10 pb-16 md:pt-16 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-16 lg:pb-24">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("heroNote")}</p>

            <h1 className="mt-6">
              <span className="block font-mono text-[0.66rem] tracking-[0.28em] text-text-muted uppercase">
                {t("welcome")}
              </span>
              <span className="display mt-3 block text-[clamp(2.7rem,12vw,7rem)] text-text">
                <span className="sr-only">UmbraChat</span>
                <span aria-hidden="true">
                  Umbra<span className="text-primary">Chat</span>
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-text-muted">
              {t("description")}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/chat/create" className="btn btn-primary">
                {t("createRoom")}
                <IoArrowForward size={17} />
              </Link>
              <Link href="/chat/search" className="btn btn-secondary">
                {t("searchRoom")}
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-5">
              {[
                { icon: IoFingerPrintOutline, label: t("trustAnonymous") },
                { icon: IoTimeOutline, label: t("trustEphemeral") },
                { icon: IoDocumentOutline, label: t("trustFiles") },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={15} className="mt-0.5 shrink-0 text-accent" />
                  <span className="font-mono text-[0.57rem] leading-relaxed tracking-[0.1em] text-text-muted uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero console */}
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <Eclipse className="pointer-events-none absolute -top-20 -right-24 h-80 w-80 text-primary/25" />

            <div className="panel corner-frame relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <span className="status-line">
                  <span className="status-dot" />
                  {t("consoleLive")}
                </span>
                <span className="font-mono text-[0.55rem] tracking-[0.18em] text-text-faint uppercase">
                  {t("consoleRoom")}
                </span>
                <span className="font-mono text-[0.55rem] tracking-[0.18em] text-accent uppercase">
                  {t("consoleExpires")}
                </span>
              </div>

              <div className="space-y-4 px-4 py-6 md:px-5">
                <div className="flex justify-end">
                  <div className="max-w-[86%] rounded-2xl rounded-br-md border border-primary/30 bg-primary/15 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-text">
                    {t("consoleMsg1")}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80 shadow-[0_0_10px_var(--primary)]" />
                  </span>
                  <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-border bg-surface/90 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-text">
                    {t("consoleMsg2")}
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-9">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
                </div>
              </div>

              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2.5">
                  <span className="truncate text-[0.8rem] text-text-faint">
                    {t("consolePlaceholder")}
                  </span>
                  <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/10 font-mono text-[0.65rem] text-accent">
                    ↵
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <span className="font-mono text-[0.52rem] tracking-[0.18em] text-text-faint uppercase">
                  no accounts / no trace
                </span>
                <span className="font-mono text-[0.52rem] tracking-[0.18em] text-text-faint uppercase">
                  24h
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/25">
        <div className="page-shell grid grid-cols-3 divide-x divide-border py-6 md:py-7">
          {[
            { value: "0", label: t("statsData") },
            { value: "24h", label: t("statsLifetime") },
            { value: "∞", label: t("statsExplore") },
          ].map((stat) => (
            <div key={stat.label} className="px-3 text-center md:px-6">
              <p className="display text-3xl text-text md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 font-mono text-[0.58rem] tracking-[0.14em] text-text-faint uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="page-shell py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{t("featuresBadge")}</p>
            <h2 className="display mt-4 max-w-xl text-4xl text-text md:text-5xl">
              {t("featuresTitle")}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-text-muted md:text-right">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="mt-11 grid gap-3 md:grid-cols-2">
          {features.map(({ icon: Icon, key, descKey }, index) => (
            <ScrollReveal key={key} delay={index * 70}>
              <article className="panel panel-lift group relative h-full overflow-hidden p-6 md:p-7">
                <span className="absolute top-5 right-5 font-mono text-[0.55rem] tracking-[0.16em] text-text-faint">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                  <Icon size={20} />
                </span>
                <h3 className="mt-7 text-lg font-semibold tracking-tight text-text">
                  {t(key)}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
                  {t(descKey)}
                </p>
                <div className="mt-6 h-px w-12 bg-border transition-colors group-hover:bg-accent/50" />
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface/20">
        <div className="page-shell py-20 md:py-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{t("howItWorks")}</p>
              <h2 className="display mt-4 text-4xl text-text md:text-5xl">
                {t("startChatting")}
              </h2>
            </div>
            <span className="font-mono text-[0.58rem] tracking-[0.2em] text-text-faint uppercase">
              03 steps / 24h
            </span>
          </div>

          <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            <div className="pointer-events-none absolute top-6 right-0 left-0 hidden h-px bg-border md:block" />
            {steps.map(({ icon: Icon, titleKey, descKey }, index) => (
              <ScrollReveal key={titleKey} delay={index * 100}>
                <div className="relative">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-accent">
                    <Icon size={20} />
                  </span>
                  <p className="mt-5 font-mono text-[0.58rem] tracking-[0.18em] text-text-faint uppercase">
                    0{index + 1} — {t("stepLabel")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-text">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
                    {t(descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-shell py-16 md:py-24">
        <div className="panel corner-frame relative overflow-hidden p-8 md:p-14">
          <Eclipse className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 text-accent/20" />
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow">Umbra / after hours</p>
            <h2 className="display mt-5 text-4xl text-text md:text-6xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
              {t("ctaDesc")}
            </p>
            <Link href="/chat/create" className="btn btn-accent mt-8">
              {t("ctaButton")}
              <IoArrowForward size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
