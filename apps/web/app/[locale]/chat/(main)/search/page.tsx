import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SearchForm from "./_views/search-form";
import { Pagination } from "@/components/ui/pagination";
import { ChatCard } from "@/components/chat/chat-card";
import { API_URL } from "@/libs/constants/api";
import { IoSearchOutline } from "react-icons/io5";

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
    <main className="flex-1 min-h-screen px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-primary text-2xl font-bold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{t("description")}</p>
        </div>

        <SearchForm />

        <div className="mt-8">
          {!name && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <IoSearchOutline size={28} />
              </div>
              <p className="text-lg text-text-muted">{t("need")}</p>
            </div>
          )}

          {name && result && (
            <div className="mb-6">
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text">
                  {result.meta.total}
                </span>{" "}
                {t("resultsFor")}{" "}
                <span className="font-medium text-text">
                  &quot;{name}&quot;
                </span>
              </p>
            </div>
          )}

          {result && result.data.length > 0 && (
            <div className="space-y-3">
              {result.data.map((item) => (
                <ChatCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  createdAt={item.createdAt}
                  lastMessageAt={item.lastMessageAt}
                  noTitleLabel={t("noTitle")}
                />
              ))}
            </div>
          )}

          {result && result.data.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-text-muted">{t("noResults")}</p>
            </div>
          )}

          {name && result && result.meta.lastPage > 1 && (
            <div className="mt-8">
              <Pagination totalPages={result.meta.lastPage} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
