"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { FavoritePlace, Branch, Place } from "@/lib/types/database";

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const { notify } = useToast();
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("favorite_branches")
        .select(
          `branch:branches(id, name, slug, city, state, description, price_range, place_id),
           place:places(id, name, slug, description, category_id)`,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error && data) {
        const rows = (
          data as unknown as Array<{ branch?: Branch; place?: Place }>
        )
          .map((r) => {
            const branch = r.branch;
            const place = r.place;
            if (!branch || !place) return undefined;
            return {
              id: branch.id,
              name: branch.name,
              slug: branch.slug,
              city: branch.city,
              state: branch.state,
              description: branch.description,
              category_id: place.category_id,
              price_range: branch.price_range,
            } as FavoritePlace;
          })
          .filter((p): p is FavoritePlace => Boolean(p));
        setFavorites(rows);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const onUnsave = async (placeId: string) => {
    if (!user?.id) return;
    const prev = favorites;
    setFavorites((f) => f.filter((p) => p.id !== placeId));
    try {
      const { error } = await supabase
        .from("favorite_branches")
        .delete()
        .eq("user_id", user.id)
        .eq("branch_id", placeId);
      if (error) throw error;
    } catch (err) {
      setFavorites(prev);
      notify(getFriendlyErrorMessage(err), "error");
    }
  };

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Your favorites</h1>
      {!user ? (
        <p className="text-muted-foreground text-sm">
          Please sign in to view your saved places.
        </p>
      ) : loading ? (
        <p className="text-sm">Loading…</p>
      ) : favorites.length === 0 ? (
        <p className="text-muted-foreground text-sm">No favorites yet.</p>
      ) : (
        <ul className="divide-border divide-y">
          {favorites.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <Link href={`/place/${p.slug}`} className="hover:underline">
                  <div className="font-medium">{p.name}</div>
                </Link>
                <div className="text-muted-foreground text-xs">
                  {[p.city, p.state].filter(Boolean).join(", ")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/place/${p.slug}`}
                  className="text-sm underline underline-offset-4"
                >
                  View
                </Link>
                <button
                  onClick={() => onUnsave(p.id)}
                  className="text-destructive text-sm underline underline-offset-4"
                >
                  Unsave
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
