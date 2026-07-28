import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  IoShieldCheckmarkOutline,
  IoChatbubblesOutline,
  IoLockClosedOutline,
  IoDocumentOutline,
  IoAddCircleOutline,
  IoChatbubbleEllipsesOutline,
  IoEyeOffOutline,
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
    <main>
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-32 pb-16 md:pt-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/8%,transparent)]" />

        <ScrollReveal>
          <article className="flex flex-col items-center gap-6 text-center">
            <Image
              src="/images/favicon-512.png"
              alt="UmbraChat Logo"
              width={96}
              height={96}
              className="animate-float drop-shadow-[0_0_32px_var(--color-primary)/30%]"
              priority
            />

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {t("welcome")}{" "}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                UmbraChat
              </span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-text-muted">
              {t("description")}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/chat/create"
                className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              >
                {t("createRoom")}
              </Link>
              <Link
                href="/chat/search"
                className="rounded-xl border border-border bg-surface px-8 py-3.5 text-sm font-semibold text-text transition-all hover:border-primary/30 hover:bg-surface-light"
              >
                {t("searchRoom")}
              </Link>
            </div>
          </article>
        </ScrollReveal>

        <div className="mt-24 w-full max-w-4xl">
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border/50 bg-surface/30 px-8 py-6 backdrop-blur-sm">
              {[
                { value: "0", label: t("statsData") },
                { value: "24h", label: t("statsLifetime") },
                { value: "∞", label: t("statsExplore") },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface/30 px-4 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
                {t("featuresBadge")}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mt-3 text-text-muted">{t("featuresSubtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2">
            {features.map(({ icon: Icon, key, descKey }, i) => (
              <ScrollReveal key={key} delay={i * 100}>
                <div className="group rounded-2xl border border-border/50 bg-surface/30 p-6 transition-all hover:border-primary/20 hover:bg-surface/50">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-text">
                    {t(key)}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {t(descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-text md:text-4xl">
              {t("howItWorks")}
            </h2>
          </ScrollReveal>

          <div className="grid gap-12 md:grid-cols-3">
            {steps.map(({ icon: Icon, titleKey, descKey }, i) => (
              <ScrollReveal key={titleKey} delay={i * 150}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon size={28} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-text">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {t(descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface/30 px-4 py-24 md:py-32">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-accent p-10 text-center text-white shadow-2xl shadow-primary/20 md:p-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="mt-4 text-white/80">{t("ctaDesc")}</p>
              <Link
                href="/chat/create"
                className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:brightness-105"
              >
                {t("ctaButton")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} {t("copyright")}</p>
          <nav className="flex flex-wrap gap-6">
            <Link href="/contact" className="transition-colors hover:text-text">
              {t("footerContact")}
            </Link>
            <Link href="/chat" className="transition-colors hover:text-text">
              {t("footerChats")}
            </Link>
            <Link href="/search" className="transition-colors hover:text-text">
              {t("footerSearch")}
            </Link>
            <Link href="/config" className="transition-colors hover:text-text">
              {t("footerSettings")}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
