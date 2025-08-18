import { supabase } from "../client";
import type { FeaturedPlaceListItem } from "../client";

// Get featured places
export async function getFeaturedPlaces(
  limit = 6,
): Promise<FeaturedPlaceListItem[]> {
  try {
    const { data, error } = await supabase
      .from("featured_places")
      .select(
        "id, name, slug, category_id, cover_image_path, tags, review_count, average_rating, last_reviewed_at, photo_count, featured_score",
      )
      .order("featured_score", { ascending: false })
      .limit(limit);

    if (error) return await getFeaturedPlacesFallback(limit);

    const primary = (data || []) as unknown as FeaturedPlaceListItem[];

    // If the view returns fewer than requested, top up using fallback
    if (primary.length < limit) {
      const fallback = await getFeaturedPlacesFallback(limit);
      const mergedMap = new Map<string, FeaturedPlaceListItem>();
      for (const p of primary) mergedMap.set(p.id, p);
      for (const f of fallback)
        if (!mergedMap.has(f.id)) mergedMap.set(f.id, f);
      return Array.from(mergedMap.values()).slice(0, limit);
    }

    return primary;
  } catch {
    return await getFeaturedPlacesFallback(limit);
  }
}

// Fallback function to get featured places directly from places table
async function getFeaturedPlacesFallback(
  limit = 6,
): Promise<FeaturedPlaceListItem[]> {
  try {
    // Get places and stats separately since branch_stats is a view
    const [placesResult, statsResult, categoriesResult] = await Promise.all([
      supabase
        .from("places")
        .select("id, name, slug, category_id, tags, is_active")
        .eq("is_active", true)
        .limit(limit * 2), // Get more to filter by stats later
      supabase
        .from("branch_stats")
        .select(
          "branch_id, review_count, average_rating, last_reviewed_at, photo_count",
        ),
      supabase.from("categories").select("id, name"),
    ]);

    if (placesResult.error) throw placesResult.error;
    if (statsResult.error) throw statsResult.error;
    if (categoriesResult.error) throw categoriesResult.error;

    const categories = categoriesResult.data || [];
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const statsMap = new Map(
      statsResult.data?.map((s) => [s.branch_id, s]) || [],
    );

    // Filter places that have at least 2 reviews and join with stats
    const placesWithStats = (placesResult.data || [])
      .map((place) => {
        const stats = statsMap.get(place.id);
        return {
          ...place,
          stats,
        };
      })
      .filter((place) => place.stats && place.stats.review_count >= 2)
      .sort(
        (a, b) =>
          (b.stats?.average_rating || 0) - (a.stats?.average_rating || 0),
      )
      .slice(0, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return placesWithStats.map((place: any) => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      category_id: place.category_id,
      category_name: place.category_id
        ? categoryMap.get(place.category_id)
        : undefined,
      cover_image_path: undefined, // Would need separate query for this
      tags: place.tags || [],
      review_count: place.stats?.review_count || 0,
      average_rating: place.stats?.average_rating || 0,
      last_reviewed_at: place.stats?.last_reviewed_at,
      photo_count: place.stats?.photo_count || 0,
      featured_score:
        (place.stats?.average_rating || 0) * 0.4 +
        Math.min((place.stats?.review_count || 0) / 10.0, 1.0) * 0.3,
    })) as FeaturedPlaceListItem[];
  } catch (error) {
    console.error("Error in fallback query:", error);
    return [];
  }
}
