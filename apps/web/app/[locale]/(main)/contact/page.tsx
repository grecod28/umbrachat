import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { IoLogoInstagram, IoMail } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://instagram.com/umbrachat",
    icon: IoLogoInstagram,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@umbrachat",
    icon: SiTiktok,
  },
  {
    name: "Gmail",
    href: "mailto:umbra.chat.web@gmail.com",
    icon: IoMail,
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
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <article className="animate-fade-in w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </div>

        <div className="space-y-4">
          {SOCIALS.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors group"
            >
              <Icon className="w-6 h-6 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">{name}</p>
                <p className="text-sm text-text-muted truncate">@umbrachat</p>
              </div>
            </a>
          ))}
        </div>
      </article>
    </main>
  );
}
