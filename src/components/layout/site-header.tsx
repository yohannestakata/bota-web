"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brand, UserActions } from "@/features/home";
import Link from "next/link";
import SearchBar from "../search-bar";

export default function SiteHeader() {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setShowSearch(y > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="bg-background border-border/60 sticky top-0 z-50 border-b">
      <div className="relative container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
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
            href="/"
            className="hover:text-foreground font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            href="/reviews/add"
            className="hover:text-foreground font-medium transition-colors"
          >
            Add Review
          </Link>
          <Link
            href="/place/add"
            className="hover:text-foreground font-medium transition-colors"
          >
            Add Place
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
