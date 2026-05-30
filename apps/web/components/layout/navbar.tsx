"use client";
import { Link } from "@/i18n/navigation";
import { NavbarProps } from "@/libs/types/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";

export function Navbar({ routes }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || /^\/[a-z]{2}$/.test(pathname);
    }
    return pathname.endsWith(href);
  };

  return (
    <nav className="flex items-center">
      {/* Desktop */}
      <ul className="hidden md:flex gap-6 list-none">
        {routes.map((route) => (
          <li key={route.href}>
            <Link
              href={route.href}
              className={`transition-colors hover:text-primary ${
                isActive(route.href) ? "text-primary font-semibold" : ""
              }`}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 z-50" // z-50 para que el botón de cierre quede encima del menú
        aria-label="Toggle menu"
      >
        {open ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      {/* Overlay (oscurece el fondo cuando el menú está abierto) */}
      <section
        className={`fixed inset-0 h-screen bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile menu (Sidebar) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-3/4 max-w-sm bg-surface shadow-xl transform transition-transform duration-300 ease-in-out md:hidden z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 pt-20">
          <ul className="flex flex-col gap-6">
            {routes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`block text-lg transition-colors hover:text-primary ${
                    isActive(route.href) ? "text-primary font-semibold" : ""
                  }`}
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </nav>
  );
}
