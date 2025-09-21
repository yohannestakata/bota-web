import React from "react";
import Link from "next/link";

export default function SectionNav() {
  const links = [
    { href: "#reviews-mobile", label: "Reviews", hideOn: "desktop" },
    { href: "#photos", label: "Photos" },
    { href: "#location-hours", label: "Location & Hours" },
    { href: "#amenities", label: "Amenities" },
    { href: "#menu", label: "Menu" },
    { href: "#other-locations", label: "Other Locations", hideOn: "desktop" },
    {
      href: "#similar-places-desktop",
      label: "Similar Places",
      hideOn: "mobile",
    },
    {
      href: "#similar-places-mobile",
      label: "Similar Places",
      hideOn: "desktop",
    },
    { href: "#reviews", label: "Reviews", hideOn: "mobile" },
  ];

  return (
    <nav
      className="border-border bg-background border-b"
      style={{ zIndex: 9998 }}
    >
      <ul className="no-scrollbar flex h-12 snap-x items-center gap-1 overflow-x-auto md:h-14 md:flex-wrap">
        {links.map((l) => (
          <li
            key={l.href}
            className={`snap-start ${l.hideOn === "desktop" ? "block md:hidden" : l.hideOn === "mobile" ? "hidden md:block" : ""}`}
          >
            <Link
              href={l.href}
              className="hover:text-foreground hover:bg-muted px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
