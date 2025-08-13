"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { searchPlaces } from "@/lib/supabase/queries";

export default function AddReviewEntryPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    Array<{ id: string; name: string; slug: string; city?: string | null }>
  >([]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const places = await searchPlaces(q, 10);
        setResults(
          (places || []).map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            city: p.city,
          })),
        );
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const canSearch = useMemo(() => query.trim().length > 1, [query]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Add a review</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Find the place. Share your take. That’s it.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or city..."
        className="border-input bg-background mb-4 w-full rounded-md border px-3 py-2 focus:outline-none"
      />
      {loading && <div className="text-sm">Looking that up…</div>}
      {!loading && canSearch && results.length === 0 && (
        <div className="text-sm">No results found.</div>
      )}
      <ul className="divide-border divide-y">
        {results.map((p) => (
          <li key={p.id} className="py-3">
            <Link
              href={`/reviews/add/${p.slug}`}
              className="hover:text-foreground flex w-full justify-between text-sm"
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{p.city || ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
