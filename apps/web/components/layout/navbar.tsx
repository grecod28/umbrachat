"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { NavbarProps } from "@/libs/types/navigation";

export function Navbar({ routes }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || /^\/[a-z]{2}$/.test(pathname);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Main navigation">
      <ul className="flex list-none items-center gap-8">
        {routes.map((route) => (
          <li key={route.href}>
            <Link
              href={route.href}
              className="nav-link"
              data-active={isActive(route.href)}
              aria-current={isActive(route.href) ? "page" : undefined}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
