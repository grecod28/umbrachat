import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FiMail } from "react-icons/fi";
import { IoLogoLinkedin } from "react-icons/io5";

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
          <a
            href="https://linkedin.com/in/santiago-greco-dominguez-681588348"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors group"
          >
            <IoLogoLinkedin className="w-6 h-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text">LinkedIn</p>
              <p className="text-sm text-text-muted truncate">
                Santiago Greco Domínguez
              </p>
            </div>
          </a>

          <a
            href="mailto:umbrachat@gmail.com"
            className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors group"
          >
            <FiMail className="w-6 h-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text">Email</p>
              <p className="text-sm text-text-muted truncate">
                umbrachat@gmail.com
              </p>
            </div>
          </a>
        </div>
      </article>
    </main>
  );
}
