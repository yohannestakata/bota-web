import { Suspense } from "react";
import RecentReviewsList from "./recent-reviews-list";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type RecentReviewEnriched } from "@/lib/types/database";
// Queries are invoked server-side via RPC in ServerRecentReviewsList
import { unstable_noStore as noStore } from "next/cache";
import FilterMenu from "./filter-menu";

export default function RecentReviews({
  filter,
  lat,
  lon,
}: {
  filter?: string;
  lat?: number;
  lon?: number;
}) {
  return (
    <section className="container mx-auto mt-16 max-w-6xl px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">
          {filter === "nearby"
            ? "Nearby reviews"
            : filter === "trending"
              ? "Trending reviews"
              : "Recent reviews"}
        </h2>
        <div>
          <FilterMenu active={filter} />
        </div>
      </div>
      <Suspense
        key={filter ?? "recent"}
        fallback={
          <div className="mt-4 grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-muted h-20 w-28" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-40" />
                  <div className="bg-muted h-3 w-24" />
                  <div className="bg-muted h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        {/* Server wrapper fetches user reactions via cookies + SSR client */}
        {/* Server Component */}
        <ServerRecentReviewsList filter={filter} lat={lat} lon={lon} />
      </Suspense>
    </section>
  );
}

// Async Server Component: fetches reviews + user reactions, passes down as props
async function ServerRecentReviewsList({
  filter,
  lat,
  lon,
}: {
  filter?: string;
  lat?: number;
  lon?: number;
}) {
  noStore(); // ensure per-request render so user cookies are respected
  type RecentReviewWithMy = RecentReviewEnriched & {
    my_reaction?: "like" | "love" | "meh" | "dislike" | null;
  };
  let dataRows: RecentReviewWithMy[] = [];
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    if (filter === "nearby" && lat != null && lon != null) {
      const { data, error } = await supabase.rpc(
        "recent_reviews_nearby_with_my_reaction",
        {
          in_lat: lat,
          in_lon: lon,
          in_radius_meters: 10000,
          in_limit: 9,
          in_user: user?.id ?? null,
        },
      );
      if (error) throw error;
      dataRows = (data || []) as RecentReviewWithMy[];
    } else if (filter === "trending") {
      const { data, error } = await supabase.rpc(
        "recent_reviews_popular_with_my_reaction",
        { in_days: 7, in_limit: 9, in_user: user?.id ?? null },
      );
      if (error) throw error;
      dataRows = (data || []) as RecentReviewWithMy[];
    } else if (filter === "recent" || !filter) {
      const { data, error } = await supabase.rpc(
        "recent_reviews_with_my_reaction",
        { in_limit: 9, in_user: user?.id ?? null },
      );
      if (error) throw error;
      dataRows = (data || []) as RecentReviewWithMy[];
    } else {
      const { data, error } = await supabase.rpc(
        "recent_reviews_food_with_my_reaction",
        { in_limit: 9, in_user: user?.id ?? null },
      );
      if (error) throw error;
      dataRows = (data || []) as RecentReviewWithMy[];
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[highlight-rpc-error]", {
        filter: filter || "recent",
        error: (e as { message?: string })?.message || String(e),
      });
    }
    dataRows = [] as RecentReviewWithMy[];
  }

  // Diagnostics: only log why highlights might be missing
  if (process.env.NODE_ENV !== "production") {
    if (!user?.id) {
      console.log("[highlight]", { userId: null, reason: "no_user_on_ssr" });
    } else {
      const withMy = dataRows.filter((r) => r.my_reaction != null).length;
      const withoutMy = dataRows.length - withMy;
      const sampleMissing = dataRows
        .filter((r) => r.my_reaction == null)
        .map((r) => r.review_id)
        .slice(0, 5);
      console.log("[highlight]", {
        userId: user.id,
        withMyReaction: withMy,
        withoutMyReaction: withoutMy,
        sampleMissing,
      });
    }
  }

  return (
    <RecentReviewsList filter={filter} lat={lat} lon={lon} items={dataRows} />
  );
}
