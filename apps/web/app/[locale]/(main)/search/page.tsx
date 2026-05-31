import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SearchForm from "./_views/search-form";
import { Pagination } from "@/components/ui/pagination";
import { API_URL } from "@/libs/constants/api";
import { formatDate } from "@/libs/functions/format-date";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; page?: string }>;
}) {
  const t = await getTranslations("Search");
  const { name, page } = await searchParams;

  let result: {
    data: {
      id: string;
      name: string;
      description: string;
      createdAt: string;
    }[];
    meta: { total: number; lastPage: number };
  } | null = null;

  if (name) {
    const query = new URLSearchParams({
      name,
      page: page ?? "1",
    }).toString();

    const res = await fetch(`${API_URL}/rooms/search?${query}`);
    result = await res.json();
    console.log(result);
  }

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

        {!name && <p className="text-center text-text-muted">{t("need")}</p>}

        {name && result && (
          <p className="text-center text-text-muted">
            <span>{result.meta.total}</span> {t("resultsFor")} &quot;
            <span className="text-text font-medium">{name}</span>
            &quot;
          </p>
        )}

        {result && result.data.length > 0 && (
          <ul className="space-y-3">
            {result.data.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/chat/${item.id}`}
                  className="block p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
                >
                  <p className="font-medium text-text">
                    {item.name || t("noTitle")}
                  </p>
                  {item.description && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-2">
                    {formatDate(item.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {result && result.data.length === 0 && (
          <p className="text-center text-text-muted">{t("noResults")}</p>
        )}

        {name && result && (
          <footer>
            <Pagination totalPages={result.meta.lastPage} />
          </footer>
        )}
      </section>
    </main>
  );
}
