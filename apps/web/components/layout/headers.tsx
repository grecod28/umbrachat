import { Link } from "@/i18n/navigation";
import { IoSearchSharp, IoSettingsOutline } from "react-icons/io5";
import { getTranslations } from "next-intl/server";
import { Route } from "@/libs/types/navigation";
import { Brand } from "@/components/brand/brand";
import { Navbar } from "./navbar";
import { MobileMenu } from "./mobile-menu";

export async function RootHeader() {
  const t = await getTranslations("Header");

  const routes: Route[] = [
    { label: t("home"), href: "/" },
    { label: t("info"), href: "/info" },
    { label: t("contact"), href: "/contact" },
    { label: t("chats"), href: "/chat" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center gap-4 md:h-20">
        <Brand size={34} className="shrink-0" />

        <div className="hidden flex-1 justify-center md:flex">
          <Navbar routes={routes} />
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href="/chat/search"
            className="btn-icon"
            aria-label={t("search")}
            title={t("search")}
          >
            <IoSearchSharp size={18} />
          </Link>
          <Link
            href="/config"
            className="btn-icon"
            aria-label={t("settings")}
            title={t("settings")}
          >
            <IoSettingsOutline size={18} />
          </Link>
          <MobileMenu routes={routes} />
        </div>
      </div>
    </header>
  );
}
