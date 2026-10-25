import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Eclipse } from "@/components/brand/eclipse";
import { LuMessageSquarePlus } from "react-icons/lu";
import { IoSearchOutline, IoTimeOutline } from "react-icons/io5";

export async function ChatWelcome() {
  const t = await getTranslations("ChatRoom");
  const createT = await getTranslations("CreateChat");
  const searchT = await getTranslations("Search");

  return (
    <section className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-6 py-14 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="dossier-grid absolute inset-0" />
        <Eclipse className="absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 text-primary/25" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <p className="eyebrow justify-center">{t("welcomeEyebrow")}</p>
        <h1 className="display mt-5 text-5xl text-text md:text-6xl">
          {t("welcomeTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-text-muted">
          {t("welcomeDesc")}
        </p>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <Link
            href="/chat/create"
            className="panel panel-lift group flex items-start gap-3 p-5 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <LuMessageSquarePlus size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text">
                {createT("title")}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                {createT("description")}
              </span>
            </span>
          </Link>

          <Link
            href="/chat/search"
            className="panel panel-lift group flex items-start gap-3 p-5 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <IoSearchOutline size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text">
                {searchT("title")}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                {searchT("description")}
              </span>
            </span>
          </Link>
        </div>

        <p className="mono-label mt-8 inline-flex items-center gap-2 text-text-faint">
          <IoTimeOutline size={13} />
          {t("expireNotice")}
        </p>
      </div>
    </section>
  );
}
