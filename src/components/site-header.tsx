"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/stay", label: "Stay" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/booking", label: "Booking" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ead8cc] bg-white/96 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[84rem] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#c45e2a,#e07040)] text-sm font-extrabold text-white">
            THO
          </div>
          <div>
            <p className="font-display text-base text-zinc-900 sm:text-lg">The HillSide Oasis</p>
            <p className="eyebrow text-[0.62rem] text-[#574030] sm:text-[0.66rem]">Western Ghats · Pollachi</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-lg border border-[#ead8cc] bg-white px-3 py-2 text-xs font-semibold text-zinc-700 sm:hidden"
        >
          Menu
        </button>

        <nav className="hidden items-center sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "px-4 py-2 text-[0.84rem] font-medium transition",
                  active
                    ? "text-[#c45e2a] font-semibold"
                    : "text-zinc-600 hover:text-[#c45e2a]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="tel:+919150360597"
          className="hidden rounded-full bg-[#c45e2a] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#9e3e12] sm:block"
        >
          Call Now
        </a>
      </div>

      {menuOpen ? (
        <div className="border-t border-[#ead8cc] bg-white p-4 sm:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    active ? "bg-orange-50 text-[#c45e2a] font-semibold" : "text-zinc-700 hover:text-[#c45e2a]",
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
