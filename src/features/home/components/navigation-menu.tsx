"use client";

import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/reviews/add", label: "Add Review" },
  { href: "/place/add", label: "Add place" },
];

export default function NavigationMenu() {
  return (
    <nav
      aria-label="Primary"
      className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="hover:text-foreground font-medium transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
