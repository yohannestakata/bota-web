import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "recent").toLowerCase();
    const limit = Math.max(
      1,
      Math.min(24, Number(searchParams.get("limit") || 12)),
    );
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radiusMeters = Number(searchParams.get("radius")) || 10000;
    const trendingDays = Number(searchParams.get("days")) || 7;

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
          setAll(cookiesToSet) {
            // propagate auth cookie updates if any
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    type RecentRow = {
      review_id: string;
      created_at: string;
      display_image?: string | null;
      likes_count?: number | null;
      loves_count?: number | null;
      mehs_count?: number | null;
      dislikes_count?: number | null;
      place_name?: string | null;
      place_slug?: string | null;
      author_full_name?: string | null;
      author_username?: string | null;
      author_id?: string | null;
      author_avatar_url?: string | null;
      category_name?: string | null;
      rating: number;
      body?: string | null;
      review_photos?: Array<{
        id: string;
        file_path: string;
        alt_text?: string | null;
        created_at: string;
      }> | null;
      branch_photos?: Array<{
        id: string;
        file_path: string;
        alt_text?: string | null;
        created_at: string;
      }> | null;
      [key: string]: unknown;
    };

    let rows: RecentRow[] = [];

    if (filter === "nearby") {
      if (!lat || !lon) {
        return NextResponse.json({ items: [] });
      }
      const effectiveLimit = offset + limit;
      const { data, error } = await supabase.rpc("recent_reviews_nearby", {
        in_lat: Number(lat),
        in_lon: Number(lon),
        in_radius_meters: radiusMeters,
        in_limit: effectiveLimit,
      });
      if (error) throw error;
      const all = (data || []) as RecentRow[];
      rows = all.slice(offset, offset + limit);
    } else if (filter === "trending") {
      const effectiveLimit = offset + limit;
      const { data, error } = await supabase.rpc("recent_reviews_popular", {
        in_days: trendingDays,
        in_limit: effectiveLimit,
      });
      if (error) throw error;
      const all = (data || []) as RecentRow[];
      rows = all.slice(offset, offset + limit);
    } else {
      const { data, error } = await supabase
        .from("recent_reviews_enriched")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      rows = (data || []) as RecentRow[];
    }

    if (user?.id && rows.length) {
      const reviewIds = rows.map((r) => r.review_id);
      const { data: reactions } = await supabase
        .from("review_reactions")
        .select("review_id, reaction_type")
        .eq("user_id", user.id)
        .in("review_id", reviewIds);
      const map = new Map<string, "like" | "love" | "meh" | "dislike">();
      for (const rec of reactions || []) {
        map.set(
          (rec as { review_id: string }).review_id,
          (rec as { reaction_type: "like" | "love" | "meh" | "dislike" })
            .reaction_type,
        );
      }
      const enriched: (RecentRow & { my_reaction?: string | null })[] =
        rows.map((r) => ({
          ...r,
          my_reaction: map.get(r.review_id) || null,
        }));
      return NextResponse.json({ items: enriched });
    }

    return NextResponse.json({ items: rows });
  } catch (e) {
    return NextResponse.json(
      { error: (e as { message?: string })?.message || "Failed to load" },
      { status: 500 },
    );
  }
}
