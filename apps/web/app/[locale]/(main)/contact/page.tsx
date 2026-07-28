import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { IoLogoInstagram, IoMail } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";

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
    },
    {
      key: "instagramLabel" as const,
      descKey: "instagramDesc" as const,
      value: "@umbrachat",
      href: "https://instagram.com/umbrachat",
      icon: IoLogoInstagram,
    },
    {
      key: "tiktokLabel" as const,
      descKey: "tiktokDesc" as const,
      value: "@umbrachat",
      href: "https://tiktok.com/@umbrachat",
      icon: SiTiktok,
    },
  ] as const;

  return (
    <main className="min-h-screen px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-16 lg:grid-cols-5 lg:gap-24">
          <section className="lg:col-span-2">
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
              {t("badge")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-4 leading-relaxed text-text-muted">
              {t("description")}
            </p>

            <div className="mt-10 space-y-6">
              {socials.map(({ key, descKey, value, href, icon: Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition-colors group-hover:border-primary/30">
                    <Icon
                      size={18}
                      className="text-text-muted transition-colors group-hover:text-primary"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{t(key)}</p>
                    <p className="truncate text-sm text-text-muted">{value}</p>
                    <p className="text-xs text-text-muted/60">{t(descKey)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-surface/50 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-text">
                {t("formTitle")}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {t("formSubtitle")}
              </p>

              <form
                action="https://formspree.io/f/xnjewdwg"
                method="POST"
                className="mt-8 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-text">
                      {t("formName")}
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text">
                      {t("formEmail")}
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-text">
                    {t("formSubject")}
                  </span>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text">
                    {t("formMessage")}
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="mt-1.5 block w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:w-auto sm:px-8"
                >
                  {t("formSend")}
                </button>
              </form>
            </div>
          </section>
        </div>

        <footer className="mt-24 border-t border-border pt-8 text-center">
          <p className="text-xs text-text-muted/50">
            &copy; {new Date().getFullYear()} {t("footer")}
          </p>
        </footer>
      </div>
    </main>
  );
}
