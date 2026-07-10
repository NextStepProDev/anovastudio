"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/contact";

const navLinks = [
  { href: "/", label: "Strona główna" },
  { href: "/oferta", label: "Oferta i cennik" },
  { href: "/zespol", label: "Zespół" },
  { href: "/galeria", label: "Galeria" },
  { href: "/wspolpraca", label: "Współpraca" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div aria-hidden className="h-0.5 bg-accent" />
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="inline-flex"
        >
          <Image
            src="/logo/logo-black.png"
            alt={`${BRAND} — rehabilitacja ortopedyczna i sportowa`}
            width={160}
            height={58}
            preload
            draggable={false}
            className="pointer-events-none select-none [-webkit-user-drag:none]"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative font-display text-sm tracking-wide transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 ${
                pathname === href
                  ? "text-ink after:scale-x-100"
                  : "text-ink-soft after:scale-x-0"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-ink transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="animate-menu-in border-t border-line bg-paper md:hidden">
          <ul className="flex flex-col px-5 py-3">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 font-display text-base ${
                    pathname === href ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
