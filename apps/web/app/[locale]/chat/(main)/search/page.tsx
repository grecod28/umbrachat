import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SearchForm from "./_views/search-form";
import { Pagination } from "@/components/ui/pagination";
import { ChatCard } from "@/components/chat/chat-card";
import { API_URL } from "@/libs/constants/api";
import { Eclipse } from "@/components/brand/eclipse";
import { PageHeading } from "@/components/layout/page-heading";
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

type SearchResult = {
  data: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    lastMessageAt?: string;
    isPrivate?: boolean;
  }[];
  meta: { total: number; lastPage: number };
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; page?: string }>;
}) {
  const t = await getTranslations("Search");
  const { name, page } = await searchParams;

  let result: SearchResult | null = null;
  let error = false;

  if (name) {
    const query = new URLSearchParams({
      name,
      page: page ?? "1",
    }).toString();

    try {
      const res = await fetch(`${API_URL}/rooms/search?${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Search failed");
      result = await res.json();
    } catch {
      error = true;
    }
  }

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-7 md:px-8 md:py-10">
        <PageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="panel mt-7 p-2">
          <SearchForm />
        </div>

        <div className="mt-7">
          {!name && (
            <div className="relative overflow-hidden rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <div className="dossier-grid absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center">
                <Eclipse className="h-24 w-24 text-primary/45" />
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-text-muted">
                  {t("need")}
                </p>
                <p className="mono-label mt-3 text-text-faint">
                  {t("searchAgain")}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-4 text-center text-sm text-danger">
              {t("error")}
            </div>
          )}

          {name && result && (
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-mono text-[0.62rem] tracking-[0.14em] text-text-faint uppercase">
                <span className="text-accent">
                  {String(result.meta.total).padStart(2, "0")}
                </span>{" "}
                {t("results")} · &quot;{name}&quot;
              </p>
              <IoSearchOutline size={14} className="text-text-faint" />
            </div>
          )}

          {result && result.data.length > 0 && (
            <div className="space-y-2">
              {result.data.map((item, index) => (
                <ChatCard
                  key={item.id}
                  id={item.id}
                  index={index + 1}
                  name={item.name}
                  description={item.description}
                  createdAt={item.createdAt}
                  lastMessageAt={item.lastMessageAt}
                  isPrivate={item.isPrivate}
                  noTitleLabel={t("noTitle")}
                />
              ))}
            </div>
          )}

          {result && result.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <Eclipse className="mx-auto h-20 w-20 text-primary/30" />
              <p className="mt-4 text-sm text-text-muted">{t("noResults")}</p>
              <p className="mono-label mt-2 text-text-faint">
                {t("searchAgain")}
              </p>
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
