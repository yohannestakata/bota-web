"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!mobileOpen) return;
      const target = e.target as Node | null;
      if (
        mobileMenuRef.current &&
        target &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    // Close on route change
    setMobileOpen(false);
  }, [pathname]);

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
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <UserActions />
          {/* Mobile hamburger (shown on small screens) - always furthest right */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="hover:bg-muted/60 focus-visible:ring-foreground/30 inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <motion.svg
              key={mobileOpen ? "close" : "hamburger"}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6"
            >
              {mobileOpen ? (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              ) : (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M3 6h18M3 12h18M3 18h18"
                />
              )}
            </motion.svg>
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Right-side drawer */}
            <motion.aside
              ref={mobileMenuRef}
              key="mobile-drawer"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              drag="x"
              dragConstraints={{ left: 0, right: 320 }}
              dragElastic={0.04}
              onDragEnd={(_, info) => {
                if (info.offset.x > 120 || info.velocity.x > 500) {
                  setMobileOpen(false);
                }
              }}
              className="border-border/60 bg-background fixed inset-y-0 right-0 z-[70] w-80 border-l shadow-xl md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-end px-3 py-3">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="hover:bg-muted/60 inline-flex h-9 w-9 items-center justify-center rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M6 6l12 12M18 6L6 18"
                    />
                  </svg>
                </button>
              </div>
              <nav className="h-[calc(100%-48px)] px-4 pb-6">
                <ul className="divide-border/60 flex flex-col divide-y">
                  <li>
                    <Link
                      href="/reviews/add"
                      className="hover:text-foreground block px-1 py-3 text-base font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Add Review
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/place/add"
                      className="hover:text-foreground block px-1 py-3 text-base font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Add Place
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/favorites"
                      className="hover:text-foreground block px-1 py-3 text-base font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Favorites
                    </Link>
                  </li>
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
