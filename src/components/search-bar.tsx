"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { getSearchHistory, saveSearchQuery } from "@/lib/supabase/queries";
import { searchBranches } from "@/lib/supabase/queries/places";
import Link from "next/link";
import { useAnalytics } from "@/hooks/use-analytics";

type SearchBarSize = "small" | "medium" | "large";

export default function SearchBar({
  size = "medium",
  elevated = true,
}: {
  size?: SearchBarSize;
  elevated?: boolean;
}) {
  const isSmall = size === "small";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; query: string }>>(
    [],
  );
  const [results, setResults] = useState<
    Array<{ id: string; name: string; slug: string; city?: string | null }>
  >([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const enableHistory =
    process.env.NEXT_PUBLIC_ENABLE_SEARCH_HISTORY === "true";
  const { trackSearchPerformed } = useAnalytics();

  // Load history on mount
  useEffect(() => {
    if (enableHistory) {
      void (async () => {
        const rows = await getSearchHistory();
        setHistory(rows.map((r) => ({ id: r.id, query: r.query })));
      })();
    }
  }, [enableHistory]);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const branches = await searchBranches(q, 10);
        setResults(
          (branches || []).map((b) => ({
            id: b.id,
            name: b.name,
            slug: `${b.place_slug}/${b.slug}`,
            city: b.city,
          })),
        );
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const dims = useMemo(() => {
    switch (size) {
      case "small":
        return {
          height: "h-12",
          text: "text-sm",
          padding: "pl-4 pr-2",
          icon: 18,
        };
      case "large":
        return { height: "h-16", text: "text-lg", padding: "px-3", icon: 24 };
      default:
        return { height: "h-12", text: "text-base", padding: "px-3", icon: 20 };
    }
  }, [size]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (enableHistory) await saveSearchQuery(q);

    // Track search performed
    trackSearchPerformed(q, results.length);

    setOpen(false);
    // TODO: Navigate to results page later
  }

  const showHistory = !query.trim() && history.length > 0;
  const showResults = query.trim() && results.length > 0;

  return (
    <div className="relative w-full max-w-3xl" ref={containerRef}>
      <form
        onSubmit={onSubmit}
        className={
          `border-border focus-within:ring-offset-accent focus-within:ring-ring mx-auto flex w-full items-center rounded-full border bg-white duration-75 focus-within:ring-2 focus-within:ring-offset-2 ` +
          `${dims.height} ` +
          `${elevated ? "shadow-lg" : "shadow-none"}`
        }
      >
        {!isSmall && (
          <SearchIcon className="text-muted-foreground ml-6" size={dims.icon} />
        )}
        <input
          type="search"
          aria-label="Search restaurants, bars, cafes…"
          placeholder="Search restaurants, bars, cafes…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={`h-full w-full rounded-full bg-transparent ${dims.padding} ${dims.text} focus:outline-none`}
        />
        {isSmall ? (
          <button
            type="submit"
            aria-label="Search"
            className="bg-primary text-primary-foreground my-3 mr-1 grid aspect-square size-10 place-items-center rounded-full"
          >
            <SearchIcon size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="bg-primary text-primary-foreground mr-3 size-fit rounded-full px-5 py-2.5 font-medium"
          >
            Search
          </button>
        )}
      </form>

      {open && (showHistory || showResults || loading) && (
        <div className="bg-popover border-border bg-background absolute z-10 mt-3 w-full overflow-hidden border shadow-2xl">
          {loading && (
            <div className="text-muted-foreground px-4 py-3 text-sm">
              Looking that up…
            </div>
          )}

          {!loading && showResults && (
            <ul className="divide-border bg-background divide-y">
              {results.map((p) => (
                <li key={p.id} className="hover:bg-muted px-4">
                  <Link
                    href={`/place/${p.slug}`}
                    className="hover:bg-muted flex w-full justify-between py-4 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {p.city || ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && showHistory && (
            <ul className="divide-border divide-y">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(h.query);
                      setOpen(false);
                    }}
                    className="hover:bg-muted/60 flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <SearchIcon className="text-muted-foreground" size={16} />
                    <span className="truncate">{h.query}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="text-muted-foreground px-4 py-3 text-sm">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
