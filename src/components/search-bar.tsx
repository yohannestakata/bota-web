"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { getSearchHistory, saveSearchQuery } from "@/lib/supabase/queries";

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
  const [history, setHistory] = useState<Array<{ id: string; query: string }>>(
    [],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const enableHistory =
    process.env.NEXT_PUBLIC_ENABLE_SEARCH_HISTORY === "true";

  useEffect(() => {
    // Prefetch user history if signed in; helpers handle anon user
    if (enableHistory) {
      void (async () => {
        const rows = await getSearchHistory();
        setHistory(rows.map((r) => ({ id: r.id, query: r.query })));
      })();
    }
  }, [enableHistory]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
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
    setOpen(false);
    // TODO: Navigate to results page when implemented
  }

  return (
    <div className="relative" ref={containerRef}>
      <form
        onSubmit={onSubmit}
        className={
          `border-border focus-within:ring-offset-accent focus-within:ring-ring mx-auto flex w-full max-w-3xl items-center rounded-full border bg-white duration-75 focus-within:ring-2 focus-within:ring-offset-2 ` +
          `${dims.height} ` +
          `${elevated ? "shadow-lg" : "shadow-none"}`
        }
      >
        {!isSmall && (
          <SearchIcon className="text-muted-foreground ml-6" size={dims.icon} />
        )}
        <input
          type="search"
          aria-label="Search for restaurants, bars, cafes, etc."
          placeholder="Search for restaurants, bars, cafes, etc."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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

      {open && history.length > 0 && (
        <div className="bg-popover border-border absolute z-10 mt-2 w-full max-w-3xl overflow-hidden rounded-2xl border shadow-xl">
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
        </div>
      )}
    </div>
  );
}
