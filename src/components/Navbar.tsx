"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "🔎 Find Doctor", short: "🔎 Doctors" },
  { href: "/health-tips", label: "💡 Health Tips", short: "💡 Tips" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
      <Link href="/" className="whitespace-nowrap text-lg font-bold text-teal-700 sm:text-xl">
        🩺 FindDoctor
      </Link>
      <div className="flex items-center gap-1 text-sm font-medium">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 ${
              pathname === l.href ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="sm:hidden">{l.short}</span>
            <span className="hidden sm:inline">{l.label}</span>
          </Link>
        ))}
        <a
          href="tel:108"
          className="ml-1 hidden rounded-lg bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 sm:inline"
        >
          🚑 108
        </a>
      </div>
    </nav>
  );
}
