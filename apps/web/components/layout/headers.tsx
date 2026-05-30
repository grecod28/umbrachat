import { Link } from "@/i18n/navigation";
import { IoSearch, IoSettingsOutline } from "react-icons/io5";
import { getTranslations } from "next-intl/server";
import { Route } from "@/libs/navigation.type";
import { Navbar } from "./navbar";

export async function RootHeader() {
  const t = await getTranslations("Header");

  const routes: Route[] = [
    { label: t("home"), href: "/" },
    { label: t("help"), href: "/help" },
    { label: t("contact"), href: "/contact" },
  ];

  return (
    <header className="absolute top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 py-6 bg-surface/25 backdrop-blur-md border-b border-primary/10 z-50">
      <Navbar routes={routes} />

      <section className="flex gap-3 items-center">
        <Link href="/search" className="hover:text-primary transition-colors">
          <IoSearch size={24} />
        </Link>

        <Link href="/config" className="hover:text-primary transition-colors">
          <IoSettingsOutline size={24} />
        </Link>
      </section>
    </header>
  );
}
