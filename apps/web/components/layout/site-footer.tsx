import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/components/brand/brand";
import { Eclipse } from "@/components/brand/eclipse";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Header");

  const columns = [
    {
      title: t("navigate"),
      links: [
        { label: nav("home"), href: "/" },
        { label: nav("info"), href: "/info" },
        { label: nav("chats"), href: "/chat" },
      ],
    },
    {
      title: t("explore"),
      links: [
        { label: t("searchRooms"), href: "/chat/search" },
        { label: t("createRoom"), href: "/chat/create" },
        { label: nav("contact"), href: "/contact" },
      ],
    },
    {
      title: t("signal"),
      links: [
        { label: t("appearance"), href: "/config/shape" },
        { label: t("language"), href: "/config/language" },
        { label: t("settings"), href: "/config" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="page-shell py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-md">
            <Brand size={44} />
            <p className="mt-6 font-display text-3xl leading-[1.05] tracking-[-0.04em] text-text md:text-4xl">
              {t("tagline")}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              {t("description")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="status-line">
                <span className="status-dot" />
                {t("status")}
              </span>
              <span className="font-mono text-[0.58rem] tracking-[0.22em] text-text-faint uppercase">
                {t("ephemeral")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mono-label text-text-faint">{column.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-muted transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {t("rights")}
          </p>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase">
            {t("signature")}
          </p>
        </div>
      </div>

      <Eclipse className="pointer-events-none absolute -right-28 -bottom-40 h-96 w-96 text-primary/20" />
    </footer>
  );
}
