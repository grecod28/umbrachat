import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiCompass } from "react-icons/fi";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center w-full px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="animate-float text-primary">
          <FiCompass className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>

        <h1 className="mt-6 text-7xl font-bold tracking-tight text-text sm:text-8xl">
          {t("title")}
        </h1>

        <p className="mt-2 text-xl font-semibold text-text-muted sm:text-2xl">
          {t("heading")}
        </p>

        <p className="mt-4 text-base leading-relaxed text-text-muted">
          {t("description")}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-text transition-all duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("cta")}
        </Link>
      </div>
    </main>
  );
}
