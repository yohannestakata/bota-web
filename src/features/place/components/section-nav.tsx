import React from "react";
import Link from "next/link";

export default function SectionNav() {
  const links = [
    { href: "#photos", label: "Photos" },
    { href: "#location-hours", label: "Location & Hours" },
    { href: "#amenities", label: "Amenities" },
    { href: "#menu", label: "Menu" },
    { href: "#similar-places", label: "Similar Places" },
    { href: "#reviews", label: "Reviews" },
  ];

  return (
    <nav
      className="border-border bg-background border-b"
      style={{ zIndex: 9998 }}
    >
      <ul className="no-scrollbar flex h-16 snap-x items-center justify-between overflow-x-auto">
        {links.map((l) => (
          <li key={l.href} className="snap-start">
            <Link
              href={l.href}
              className="hover:text-foreground hover:bg-muted px-3 py-1.5 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
