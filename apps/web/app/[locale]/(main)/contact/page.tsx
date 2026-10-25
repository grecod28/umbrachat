import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { IoLogoInstagram, IoMail, IoArrowForward } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
import { PageHeading } from "@/components/layout/page-heading";
import { Eclipse } from "@/components/brand/eclipse";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  const socials = [
    {
      key: "emailLabel" as const,
      descKey: "emailDesc" as const,
      value: "umbra.chat.web@gmail.com",
      href: "mailto:umbra.chat.web@gmail.com",
      icon: IoMail,
      external: false,
    },
    {
      key: "instagramLabel" as const,
      descKey: "instagramDesc" as const,
      value: "@umbrachat",
      href: "https://instagram.com/umbrachat",
      icon: IoLogoInstagram,
      external: true,
    },
    {
      key: "tiktokLabel" as const,
      descKey: "tiktokDesc" as const,
      value: "@umbrachat",
      href: "https://tiktok.com/@umbrachat",
      icon: SiTiktok,
      external: true,
    },
  ] as const;

  return (
    <main className="relative overflow-hidden">
      <Eclipse className="pointer-events-none absolute -top-32 -right-32 h-[26rem] w-[26rem] text-primary/20" />

      <div className="page-shell py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <section>
            <PageHeading
              eyebrow={t("badge")}
              title={t("title")}
              description={t("description")}
            />

            <div className="mt-10 space-y-2">
              {socials.map(
                ({ key, descKey, value, href, icon: Icon, external }) => (
                  <a
                    key={key}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group panel-quiet flex items-center gap-4 p-3.5 transition-colors hover:border-border-strong hover:bg-surface"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-accent transition-colors group-hover:border-accent/30">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.82rem] font-medium text-text">
                        {t(key)}
                      </span>
                      <span className="block truncate text-[0.72rem] text-text-muted">
                        {value}
                      </span>
                    </span>
                    <span className="hidden font-mono text-[0.54rem] tracking-[0.14em] text-text-faint uppercase sm:block">
                      {t(descKey)}
                    </span>
                    <IoArrowForward
                      size={15}
                      className="shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </a>
                ),
              )}
            </div>

            <div className="mt-10 border-t border-border pt-5">
              <p className="status-line">
                <span className="status-dot" />
                {t("responseWindow")}
              </p>
              <p className="mt-2 font-mono text-[0.56rem] tracking-[0.14em] text-text-faint uppercase">
                {t("noTrace")}
              </p>
            </div>
          </section>

          <section className="panel corner-frame p-5 md:p-8">
            <p className="mono-label text-accent">{t("formTitle")}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text">
              {t("formSubtitle")}
            </h2>

            <form
              action="https://formspree.io/f/xnjewdwg"
              method="POST"
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">{t("formName")}</span>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    className="field mt-2"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t("formEmail")}</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="field mt-2"
                  />
                </label>
              </div>

              <label className="block">
                <span className="field-label">{t("formSubject")}</span>
                <input type="text" name="subject" required className="field mt-2" />
              </label>

              <label className="block">
                <span className="field-label">{t("formMessage")}</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="field mt-2 resize-none"
                />
              </label>

              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                {t("formSend")}
                <IoArrowForward size={17} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
