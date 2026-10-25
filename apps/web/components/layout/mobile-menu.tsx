"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Route } from "@/libs/types/navigation";
import {
  IoClose,
  IoMenu,
  IoSearchSharp,
  IoSettingsOutline,
  IoArrowForward,
} from "react-icons/io5";
import { Brand } from "@/components/brand/brand";

export function MobileMenu({ routes }: { routes: Route[] }) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const t = useTranslations("Header");
  const open = openPath === pathname;

  const closeMenu = () => setOpenPath(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null);
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || /^\/[a-z]{2}$/.test(pathname)
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenPath(pathname)}
        className="btn-icon md:hidden"
        aria-label={t("openMenu")}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <IoMenu size={20} />
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-menu"
            className="fixed inset-0 z-[80] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={closeMenu}
              aria-label={t("closeMenu")}
            />

            <aside className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-fade-in flex-col overflow-y-auto border-l border-border bg-background px-6 pt-6 pb-8">
              <div className="flex items-center justify-between">
                <Brand size={36} />
                <button
                  type="button"
                  onClick={closeMenu}
                  className="btn-icon"
                  aria-label={t("closeMenu")}
                >
                  <IoClose size={19} />
                </button>
              </div>

              <p className="mt-10 font-mono text-[0.58rem] tracking-[0.28em] text-text-faint uppercase">
                {t("navigate")}
              </p>

              <nav className="mt-3" aria-label="Mobile navigation">
                <ul className="list-none">
                  {routes.map((route, index) => (
                    <li key={route.href}>
                      <Link
                        href={route.href}
                        onClick={closeMenu}
                        className="group flex items-center justify-between border-b border-border py-4"
                        aria-current={isActive(route.href) ? "page" : undefined}
                      >
                        <span
                          className={`display text-4xl transition-colors ${
                            isActive(route.href)
                              ? "text-text"
                              : "text-text-muted group-hover:text-text"
                          }`}
                        >
                          {route.label}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-[0.58rem] tracking-[0.2em] text-text-faint">
                            0{index + 1}
                          </span>
                          <IoArrowForward
                            size={16}
                            className="text-text-faint transition-transform group-hover:translate-x-1 group-hover:text-accent"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-8 grid grid-cols-2 gap-2">
                <Link
                  href="/chat/search"
                  onClick={closeMenu}
                  className="panel-quiet flex items-center gap-2 px-3 py-3 text-sm text-text-muted"
                >
                  <IoSearchSharp size={17} className="text-accent" />
                  {t("search")}
                </Link>
                <Link
                  href="/config"
                  onClick={closeMenu}
                  className="panel-quiet flex items-center gap-2 px-3 py-3 text-sm text-text-muted"
                >
                  <IoSettingsOutline size={17} className="text-accent" />
                  {t("settings")}
                </Link>
              </div>

              <div className="mt-auto pt-12">
                <p className="status-line">
                  <span className="status-dot" />
                  {t("signal")}
                </p>
                <p className="mt-2 font-mono text-[0.58rem] tracking-[0.2em] text-text-faint uppercase">
                  {t("noTrace")}
                </p>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
