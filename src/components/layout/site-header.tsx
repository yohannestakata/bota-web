"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brand, UserActions } from "@/features/home";
import Link from "next/link";
import SearchBar from "../search-bar";
import { usePathname } from "next/navigation";

type HeaderMode = "scroll" | "static";

export default function SiteHeader({
  mode,
}: {
  mode?: HeaderMode; // if undefined, auto: scroll only on home
}) {
  const pathname = usePathname();
  const resolvedMode: HeaderMode = useMemo(() => {
    if (mode) return mode;
    return pathname === "/" ? "scroll" : "static";
  }, [mode, pathname]);

  const [showSearch, setShowSearch] = useState(resolvedMode === "static");

  useEffect(() => {
    if (resolvedMode === "static") {
      setShowSearch(true);
      return;
    }
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setShowSearch(y > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [resolvedMode]);

  return (
    <header
      className="bg-background border-border/60 sticky top-0 z-50 border-b"
      style={{ zIndex: 9999 }}
    >
      <div className="relative container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-18">
        <Brand />
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          aria-label="Primary"
          className={`hidden items-center gap-8 md:flex ${
            !showSearch ? "absolute left-1/2 -translate-x-1/2" : ""
          }`}
        >
          <Link
            href="/reviews/add"
            className="hover:text-foreground transition-colors"
          >
            Add Review
          </Link>
          <Link
            href="/place/add"
            className="hover:text-foreground transition-colors"
          >
            Add Place
          </Link>
          <Link
            href="/favorites"
            className="hover:text-foreground transition-colors"
          >
            My Favorites
          </Link>
        </motion.nav>
        <AnimatePresence initial={false}>
          {showSearch && (
            <motion.div
              key="inline-search"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 320 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="mr-3 hidden h-full items-center overflow-visible md:flex"
            >
              <div className="w-[320px]">
                <SearchBar size="small" elevated={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <UserActions />
      </div>
    </header>
  );
}
