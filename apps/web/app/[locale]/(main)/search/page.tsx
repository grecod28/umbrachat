import { getTranslations } from "next-intl/server";
import SearchForm from "./_views/search-form";
import { API_URL } from "@/libs/constants/api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const t = await getTranslations("Search");
  const { name } = await searchParams;
  //const res = await fetch(`${API_URL}/${name}`)

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 px-4">
      <section className="animate-fade-in w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </header>

        <SearchForm />

        <p className="text-center text-text-muted">
          {name ? (
            <>
              {t("resultsFor")} &quot;
              <span className="text-text font-medium">{name}</span>
              &quot;
            </>
          ) : (
            <span className="text-text font-medium">{t("need")}</span>
          )}
        </p>
      </section>
    </main>
  );
}
