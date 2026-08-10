"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoMark from "@/components/logo-mark";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/stay", label: "Stay" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/booking", label: "Booking" },
];

type SiteHeaderProps = {
  contactPhoneHref: string;
};

export default function SiteHeader({ contactPhoneHref }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#d5c7b3] bg-[#f8f3ea]/94 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <LogoMark priority className="h-11 w-11 sm:h-12 sm:w-12" imageClassName="drop-shadow-lg" />
          <div>
            <p className="font-display text-[1.35rem] leading-none text-[#1f1812] sm:text-[1.52rem]">The HillSide Oasis</p>
            <p className="eyebrow text-[0.58rem] text-[#6c5c4c] sm:text-[0.62rem]">Pollachi . Heritage Retreat</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="rounded-full border border-[#c8b79f] bg-[#fffaf2] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-700 lg:hidden"
        >
          Menu
        </button>

        <nav className="hidden items-center rounded-full border border-[#d7c8b5] bg-[#fbf6ee] px-2 py-1.5 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 text-[0.74rem] font-bold uppercase tracking-[0.12em] transition",
                  active
                    ? "bg-[#214032] text-[#f8f0e4]"
                    : "text-zinc-600 hover:bg-[#efe3d4] hover:text-[#214032]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a
          href={contactPhoneHref}
          className="hidden rounded-full border border-[#2f4f41] bg-[#214032] px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8f0e4] transition hover:bg-[#163125] xl:block"
        >
          Reserve By Phone
        </a>
      </div>

      {menuOpen ? (
        <div id="mobile-nav-menu" className="border-t border-[#d6c7b4] bg-[#f9f3ea] p-4 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.11em]",
                    active
                      ? "border-[#214032] bg-[#214032] text-[#f8f0e4]"
                      : "border-[#decfbc] bg-[#fffaf2] text-zinc-700 hover:border-[#b9a489] hover:text-[#214032]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
