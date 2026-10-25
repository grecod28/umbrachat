import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Eclipse } from "@/components/brand/eclipse";
import { IoHomeOutline, IoSearchOutline } from "react-icons/io5";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("notFound.title"),
    description: t("notFound.description"),
  };
}

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="relative flex min-h-[72vh] flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="dossier-grid pointer-events-none absolute inset-0" />
      <Eclipse className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-primary/25" />

      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="eyebrow justify-center">{t("eyebrow")}</p>
        <p className="display mt-6 text-[clamp(6rem,20vw,11rem)] leading-none text-text">
          {t("title")}
        </p>
        <h1 className="display mt-4 text-3xl text-text md:text-4xl">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <IoHomeOutline size={17} />
            {t("cta")}
          </Link>
          <Link href="/chat/search" className="btn btn-secondary">
            <IoSearchOutline size={17} />
            {t("search")}
          </Link>
        </div>

        <p className="mono-label mt-10 text-text-faint">
          {t("lost")}
        </p>
      </div>
    </main>
  );
}
