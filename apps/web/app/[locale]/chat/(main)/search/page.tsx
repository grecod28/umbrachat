import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SearchForm from "./_views/search-form";
import { Pagination } from "@/components/ui/pagination";
import { ChatCard } from "@/components/chat/chat-card";
import { API_URL } from "@/libs/constants/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("search.title"),
    description: t("search.description"),
  };
}

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
      description?: string;
      createdAt: string;
      lastMessageAt?: string;
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
  }

  return (
    <main className="flex-1 min-h-screen flex flex-col items-center pt-8 px-4">
      <section className="animate-fade-in w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </header>

        <SearchForm />

        {!name && (
          <p className="text-center text-lg text-text mt-4 py-4 px-6 rounded-xl bg-surface border border-border">
            {t("need")}
          </p>
        )}

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
                <ChatCard
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  createdAt={item.createdAt}
                  lastMessageAt={item.lastMessageAt}
                  noTitleLabel={t("noTitle")}
                />
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
