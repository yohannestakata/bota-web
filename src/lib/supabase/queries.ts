import { supabase } from "./client";
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  Place,
  PlaceWithStats,
  Category,
  Review,
  FeaturedPlaceListItem,
  ReviewStats,
  NearbyPlace,
  CuisineType,
  Profile,
  SearchHistoryRow,
  ReviewPhoto,
} from "./client";

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon_name, created_at")
    .order("name");

  if (error) throw error;
  return data || [];
}

// List all photo categories
export async function getPhotoCategories(): Promise<
  { id: number; name: string }[]
> {
  const { data, error } = await supabase
    .from("photo_categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return (data || []) as { id: number; name: string }[];
}

// Flat list of menu items for a place (id + name)
export async function getMenuItemsForPlace(
  placeId: string,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name")
    .eq("place_id", placeId)
    .order("name");
  if (error) throw error;
  return (data || []) as { id: string; name: string }[];
}

// Cuisine types
export async function getCuisineTypes(): Promise<CuisineType[]> {
  const { data, error } = await supabase
    .from("cuisine_types")
    .select("id, name, description, created_at")
    .order("name");

  if (error) throw error;
  return data || [];
}

// Get place with category and stats
export async function getPlaceWithDetails(
  placeId: string,
): Promise<PlaceWithStats & { category?: Category }> {
  const { data: place, error: placeError } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, address_line1, address_line2, city, state, postal_code, country, 
      phone, website_url, latitude, longitude, category_id, tags, business_hours, price_range, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("id", placeId)
    .single();

  if (placeError) throw placeError;

  // Get stats
  const { data: stats, error: statsError } = await supabase
    .from("place_stats")
    .select(
      "place_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .eq("place_id", placeId)
    .single();

  if (statsError && statsError.code !== "PGRST116") throw statsError; // PGRST116 = no rows returned

  return {
    ...place,
    place_stats: stats || undefined,
    category: place.categories?.[0],
  };
}

// Get place by slug with category and stats
export async function getPlaceBySlugWithDetails(
  slug: string,
): Promise<(PlaceWithStats & { category?: Category }) | null> {
  const { data: place, error: placeError } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, address_line1, address_line2, city, state, postal_code, country,
      phone, website_url, latitude, longitude, category_id, tags, business_hours, price_range,
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("slug", slug)
    .single();

  if (placeError) {
    if ((placeError as PostgrestError).code === "PGRST116") return null;
    throw placeError;
  }

  const { data: stats, error: statsError } = await supabase
    .from("place_stats")
    .select(
      "place_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .eq("place_id", place.id)
    .single();

  if (statsError && (statsError as PostgrestError).code !== "PGRST116")
    throw statsError;

  return {
    ...place,
    place_stats: stats || undefined,
    category: place.categories?.[0],
  } as PlaceWithStats & { category?: Category };
}

// Get place photos
export async function getPlacePhotos(
  placeId: string,
  limit = 12,
  categoryId?: number | null,
) {
  let query = supabase
    .from("place_photos")
    .select("id, file_path, alt_text, created_at, photo_category_id")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (categoryId != null) {
    query = query.eq("photo_category_id", categoryId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Create a review and optional initial photos
export async function createReview(
  placeId: string,
  rating: number,
  body: string,
  visitedAt: string | null,
): Promise<Review> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");
  // Rely on DB trigger to create profiles; do not insert from client
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      place_id: placeId,
      author_id: user.id,
      rating,
      body,
      visited_at: visitedAt,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as Review;
}

// Upload a review photo file to storage and record row
export async function uploadReviewPhoto(
  reviewId: string,
  file: File,
  opts?: {
    altText?: string;
    photoCategoryId?: number | null;
    menuItemId?: string | null;
  },
): Promise<ReviewPhoto> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1) Ask our server to sign a Cloudinary upload
  const base = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
  const kind = opts?.menuItemId ? "menus" : "reviews";
  const folder = `${base}/${kind}/${reviewId}`;
  const signRes = await fetch("/api/uploads/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Failed to sign upload");
  const { timestamp, signature, apiKey, cloudName } = await signRes.json();

  // 2) Upload directly to Cloudinary
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
  const uploaded = (await uploadRes.json()) as {
    secure_url: string;
    public_id: string;
  };

  // 3) Persist row in our DB
  const { data, error } = await supabase
    .from("review_photos")
    .insert({
      review_id: reviewId,
      author_id: user.id,
      file_path: uploaded.secure_url,
      // Consider adding a cloud_public_id column to store uploaded.public_id
      alt_text: opts?.altText ?? null,
      photo_category_id: opts?.photoCategoryId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Optionally link to a menu item photo record
  if (opts?.menuItemId) {
    await supabase.from("menu_item_photos").insert({
      menu_item_id: opts.menuItemId,
      author_id: user.id,
      file_path: uploaded.secure_url,
      alt_text: opts?.altText ?? null,
    });
  }

  return data as unknown as ReviewPhoto;
}

// Get photo categories used by photos of a place with counts
export async function getPlacePhotoCategories(placeId: string) {
  const { data, error } = await supabase
    .from("place_photos")
    .select("photo_category_id, photo_categories(name)")
    .eq("place_id", placeId);
  if (error) throw error;
  const rows = (data || []) as Array<{
    photo_category_id: number | null;
    photo_categories?: { name: string } | { name: string }[] | null;
  }>;
  const counts = new Map<
    number | null,
    { id: number | null; name: string; count: number }
  >();
  for (const row of rows) {
    const id = row.photo_category_id;
    const cat = row.photo_categories;
    const catName = Array.isArray(cat) ? cat[0]?.name : cat?.name;
    const resolvedName = catName ?? (id == null ? "Uncategorized" : "Category");
    const existing = counts.get(id) || { id, name: resolvedName, count: 0 };
    const next = {
      id,
      name: catName ?? existing.name,
      count: existing.count + 1,
    };
    counts.set(id, next);
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

// Get reviews for a place, joined with author and stats via parallel queries
export async function getReviewsForPlace(placeId: string, limit = 10) {
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      "id, place_id, author_id, rating, body, visited_at, created_at, updated_at",
    )
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reviewsError) throw reviewsError;

  const reviewIds = (reviews || []).map((r) => r.id);
  const authorIds = Array.from(
    new Set((reviews || []).map((r) => r.author_id)),
  );

  const [statsResult, authorsResult, photosResult] = await Promise.all([
    reviewIds.length
      ? supabase
          .from("review_stats")
          .select(
            "review_id, total_reactions, likes_count, loves_count, mehs_count, dislikes_count",
          )
          .in("review_id", reviewIds)
      : Promise.resolve({ data: [], error: null } as const),
    authorIds.length
      ? supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, created_at, updated_at")
          .in("id", authorIds)
      : Promise.resolve({ data: [], error: null } as const),
    reviewIds.length
      ? supabase
          .from("review_photos")
          .select("id, review_id, file_path, alt_text")
          .in("review_id", reviewIds)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (statsResult.error) throw statsResult.error;
  if (authorsResult.error) throw authorsResult.error;
  if (photosResult.error) throw photosResult.error;

  const statsMap = new Map(
    (statsResult.data || []).map((s) => [s.review_id, s]),
  );
  const authorsMap = new Map((authorsResult.data || []).map((a) => [a.id, a]));
  const photosByReview = new Map<
    string,
    { id: string; file_path: string; alt_text?: string | null }[]
  >();
  for (const p of photosResult.data || []) {
    const list = photosByReview.get(p.review_id) || [];
    list.push({ id: p.id, file_path: p.file_path, alt_text: p.alt_text });
    photosByReview.set(p.review_id, list);
  }

  return (reviews || []).map((r) => ({
    ...r,
    review_stats: statsMap.get(r.id) || undefined,
    author: authorsMap.get(r.author_id) || undefined,
    photos: photosByReview.get(r.id) || [],
  }));
}

// Batched replies fetch for multiple reviews, including authors and photos
export async function getRepliesForReviewIds(reviewIds: string[]) {
  if (!reviewIds.length)
    return new Map<
      string,
      Array<{
        id: string;
        review_id: string;
        author_id: string;
        body: string;
        created_at: string;
        updated_at: string;
        author?: Partial<Profile>;
        photos?: { id: string; file_path: string; alt_text?: string | null }[];
      }>
    >();

  const { data: replies, error: repliesError } = await supabase
    .from("review_replies")
    .select("id, review_id, author_id, body, created_at, updated_at")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });
  if (repliesError) throw repliesError;

  const replyList = replies || [];
  const replyIds = replyList.map((r) => r.id);
  const authorIds = Array.from(new Set(replyList.map((r) => r.author_id)));

  const [authorsResult, photosResult] = await Promise.all([
    authorIds.length
      ? supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, created_at, updated_at")
          .in("id", authorIds)
      : Promise.resolve({ data: [], error: null } as const),
    replyIds.length
      ? supabase
          .from("review_reply_photos")
          .select("id, reply_id, file_path, alt_text")
          .in("reply_id", replyIds)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (authorsResult.error) throw authorsResult.error;
  if (photosResult.error) throw photosResult.error;

  const authorsMap = new Map((authorsResult.data || []).map((a) => [a.id, a]));
  const photosByReply = new Map<
    string,
    { id: string; file_path: string; alt_text?: string | null }[]
  >();
  for (const p of photosResult.data || []) {
    const list = photosByReply.get(p.reply_id) || [];
    list.push({
      id: p.id,
      file_path: p.file_path,
      alt_text: p.alt_text ?? null,
    });
    photosByReply.set(p.reply_id, list);
  }

  const byReview = new Map<
    string,
    Array<{
      id: string;
      review_id: string;
      author_id: string;
      body: string;
      created_at: string;
      updated_at: string;
      author?: Partial<Profile>;
      photos?: { id: string; file_path: string; alt_text?: string | null }[];
    }>
  >();
  for (const r of replyList) {
    const enriched = {
      ...r,
      author: authorsMap.get(r.author_id) || undefined,
      photos: photosByReply.get(r.id) || [],
    };
    const list = byReview.get(r.review_id) || [];
    list.push(enriched);
    byReview.set(r.review_id, list);
  }

  return byReview;
}

// Find similar places in the same category, excluding current place, joined with stats
export async function getSimilarPlaces(
  categoryId: number | undefined,
  excludePlaceId: string,
  limit = 6,
) {
  if (!categoryId) return [];

  const [placesResult, statsResult] = await Promise.all([
    supabase
      .from("places")
      .select(
        "id, name, slug, category_id, tags, is_active, created_at, updated_at",
      )
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .neq("id", excludePlaceId)
      .limit(limit * 2),
    supabase
      .from("place_stats")
      .select(
        "place_id, review_count, average_rating, last_reviewed_at, photo_count",
      ),
  ]);

  if (placesResult.error) throw placesResult.error;
  if (statsResult.error) throw statsResult.error;

  const statsMap = new Map(
    (statsResult.data || []).map((s) => [s.place_id, s]),
  );

  return (placesResult.data || [])
    .map((p) => ({
      ...p,
      place_stats: statsMap.get(p.id) || undefined,
    }))
    .sort(
      (a, b) =>
        (b.place_stats?.average_rating || 0) -
        (a.place_stats?.average_rating || 0),
    )
    .slice(0, limit);
}

// Get normalized hours for a place (0=Sunday..6=Saturday)
export async function getPlaceHours(placeId: string) {
  const { data, error } = await supabase
    .from("place_hours")
    .select("day_of_week, open_time, close_time, is_closed, is_24_hours")
    .eq("place_id", placeId)
    .order("day_of_week");
  if (error) throw error;
  return data || [];
}

// Get amenities for a place
export async function getPlaceAmenities(placeId: string) {
  const { data, error } = await supabase
    .from("place_amenities")
    .select(
      "place_id, amenity_type_id, value, amenity_types(id, key, name, icon_name)",
    )
    .eq("place_id", placeId);
  if (error) throw error;
  return (data || []).map((row) => ({
    place_id: row.place_id,
    amenity_type_id: row.amenity_type_id,
    value: row.value,
    // Supabase returns a single related object for one-to-one relationships
    // not an array; use it directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    amenity: (row as any).amenity_types,
  }));
}

// Get menu items for a place (for restaurants)
export async function getPlaceMenu(placeId: string) {
  // Fetch sections and items in parallel
  const [sectionsRes, itemsRes] = await Promise.all([
    supabase
      .from("menu_sections")
      .select("id, name, position")
      .eq("place_id", placeId)
      .order("position"),
    supabase
      .from("menu_items")
      .select(
        "id, section_id, name, description, price, currency, is_available, created_at, menu_item_photos(id, file_path, alt_text)",
      )
      .eq("place_id", placeId)
      .order("name"),
  ]);

  if (sectionsRes.error) throw sectionsRes.error;
  if (itemsRes.error) throw itemsRes.error;

  type Section = { id: string; name: string; position?: number | null };
  type Item = {
    id: string;
    section_id?: string | null;
    name: string;
    description?: string | null;
    price?: number | null;
    currency?: string | null;
    is_available: boolean;
    created_at: string;
    menu_item_photos?: {
      id: string;
      file_path: string;
      alt_text?: string | null;
    }[];
  };

  const sections: Section[] = (sectionsRes.data || []) as Section[];
  const items: Item[] = (itemsRes.data || []) as Item[];
  const bySection = new Map<string, Item[]>();
  for (const s of sections) bySection.set(s.id, []);
  const ungrouped: Item[] = [];

  for (const it of items) {
    if (it.section_id && bySection.has(it.section_id)) {
      (bySection.get(it.section_id) as Item[]).push(it);
    } else {
      ungrouped.push(it);
    }
  }

  return { sections, itemsBySection: bySection, ungrouped };
}

// Get review with place and author details
export async function getReviewWithDetails(reviewId: string): Promise<
  Review & {
    place?: Partial<Place>;
    author?: Partial<Profile>;
    review_stats?: ReviewStats;
  }
> {
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select(
      `
      id, place_id, author_id, rating, body, visited_at, owner_response, 
      owner_response_at, owner_response_by, created_at, updated_at,
      places(id, name, slug, category_id, created_at),
      profiles(id, username, full_name, avatar_url, created_at)
    `,
    )
    .eq("id", reviewId)
    .single();

  if (reviewError) throw reviewError;

  // Get review stats
  const { data: stats, error: statsError } = await supabase
    .from("review_stats")
    .select(
      "review_id, total_reactions, likes_count, loves_count, mehs_count, dislikes_count",
    )
    .eq("review_id", reviewId)
    .single();

  if (statsError && statsError.code !== "PGRST116") throw statsError;

  return {
    ...review,
    place: review.places?.[0],
    author: review.profiles?.[0],
    review_stats: stats || undefined,
  };
}

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon_name, created_at")
    .order("name");

  if (error) throw error;
  return data || [];
}

// Places with stats
export async function getPlaces(limit = 20): Promise<PlaceWithStats[]> {
  // Get all places and stats in parallel
  const [placesResult, statsResult] = await Promise.all([
    supabase
      .from("places")
      .select(
        "id, name, slug, description, address_line1, address_line2, city, state, postal_code, country, phone, website_url, latitude, longitude, category_id, tags, business_hours, price_range, owner_id, is_active, created_at, updated_at",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("place_stats")
      .select(
        "place_id, review_count, average_rating, last_reviewed_at, photo_count",
      ),
  ]);

  if (placesResult.error) throw placesResult.error;
  if (statsResult.error) throw statsResult.error;

  // Join places with their stats
  const placesWithStats = (placesResult.data || []).map((place) => ({
    ...place,
    place_stats:
      (statsResult.data || []).find((stat) => stat.place_id === place.id) ||
      undefined,
  }));

  return placesWithStats;
}

// Places by category with stats and latest cover image
export async function getPlacesByCategory(
  categoryId: number,
  page = 1,
  pageSize = 12,
  sort: "rating" | "recent" = "rating",
): Promise<
  Array<
    PlaceWithStats & {
      cover_image_path?: string;
    }
  >
> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: placesData, error: placesError } = await supabase
    .from("places")
    .select(
      "id, name, slug, category_id, tags, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .range(from, to);
  if (placesError) throw placesError;
  const placeIds = (placesData || []).map((p) => p.id);

  const [statsRes, photosRes] = await Promise.all([
    placeIds.length
      ? supabase
          .from("place_stats")
          .select(
            "place_id, review_count, average_rating, last_reviewed_at, photo_count",
          )
          .in("place_id", placeIds)
      : Promise.resolve({ data: [], error: null } as const),
    placeIds.length
      ? supabase
          .from("place_photos")
          .select("place_id, file_path, created_at")
          .in("place_id", placeIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (statsRes.error) throw statsRes.error;
  if (photosRes.error) throw photosRes.error;

  const statsMap = new Map(
    (statsRes.data || []).map((s) => [s.place_id as string, s]),
  );
  const coverMap = new Map<string, string>();
  for (const row of photosRes.data || []) {
    const pid = row.place_id as string;
    if (!coverMap.has(pid)) coverMap.set(pid, row.file_path as string);
  }

  const enriched = (placesData || []).map((p) => ({
    ...p,
    place_stats: statsMap.get(p.id) || undefined,
    cover_image_path: coverMap.get(p.id),
  }));

  const sorted = enriched.sort((a, b) => {
    if (sort === "recent") {
      const at = new Date(
        a.place_stats?.last_reviewed_at || a.updated_at,
      ).getTime();
      const bt = new Date(
        b.place_stats?.last_reviewed_at || b.updated_at,
      ).getTime();
      return bt - at;
    }
    // rating
    return (
      (b.place_stats?.average_rating || 0) -
      (a.place_stats?.average_rating || 0)
    );
  });

  return sorted;
}

export async function getPlacesByCategoryPaged(
  categoryId: number,
  page = 1,
  pageSize = 12,
  sort: "rating" | "recent" = "rating",
): Promise<{
  data: Array<PlaceWithStats & { cover_image_path?: string }>;
  total: number;
}> {
  const { count } = await supabase
    .from("places")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category_id", categoryId);

  const data = await getPlacesByCategory(categoryId, page, pageSize, sort);
  return { data, total: count ?? 0 };
}

// Featured places using materialized view with hybrid scoring algorithm
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
    // Get places and stats separately since place_stats is a view
    const [placesResult, statsResult, categoriesResult] = await Promise.all([
      supabase
        .from("places")
        .select("id, name, slug, category_id, tags, is_active")
        .eq("is_active", true)
        .limit(limit * 2), // Get more to filter by stats later
      supabase
        .from("place_stats")
        .select(
          "place_id, review_count, average_rating, last_reviewed_at, photo_count",
        ),
      supabase.from("categories").select("id, name"),
    ]);

    if (placesResult.error) throw placesResult.error;
    if (statsResult.error) throw statsResult.error;
    if (categoriesResult.error) throw categoriesResult.error;

    const categories = categoriesResult.data || [];
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const statsMap = new Map(
      statsResult.data?.map((s) => [s.place_id, s]) || [],
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

// Recent reviews with stats, place, and author details
export async function getRecentReviews(limit = 5): Promise<{
  data: (Review & {
    review_stats?: ReviewStats;
    place?: Partial<Place>;
    author?: Partial<Profile>;
    category_name?: string;
  })[];
  error: {
    code?: string;
    message: string;
    details?: string | null;
    hint?: string | null;
  } | null;
}> {
  const { data, error } = await supabase
    .from("recent_reviews_enriched")
    .select(
      "review_id, place_id, author_id, rating, body, visited_at, owner_response, owner_response_at, owner_response_by, created_at, updated_at, place_name, place_slug, category_id, category_name, author_username, author_full_name, author_avatar_url, total_reactions, likes_count, loves_count, mehs_count, dislikes_count",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    return {
      data: [],
      error: {
        code: (error as PostgrestError).code,
        message: (error as PostgrestError).message,
        details: (error as PostgrestError).details,
        hint: (error as PostgrestError).hint,
      },
    };

  const mapped = (data || []).map((row) => ({
    id: row.review_id,
    place_id: row.place_id,
    author_id: row.author_id,
    rating: row.rating,
    body: row.body,
    visited_at: row.visited_at,
    owner_response: row.owner_response,
    owner_response_at: row.owner_response_at,
    owner_response_by: row.owner_response_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    place: {
      id: row.place_id,
      name: row.place_name,
      slug: row.place_slug,
      category_id: row.category_id,
      is_active: true,
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as Partial<Place>,
    author: {
      id: row.author_id,
      username: row.author_username ?? undefined,
      full_name: row.author_full_name ?? undefined,
      avatar_url: row.author_avatar_url ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as Partial<Profile>,
    review_stats: {
      review_id: row.review_id,
      total_reactions: row.total_reactions ?? 0,
      likes_count: row.likes_count ?? 0,
      loves_count: row.loves_count ?? 0,
      mehs_count: row.mehs_count ?? 0,
      dislikes_count: row.dislikes_count ?? 0,
    } as ReviewStats,
  }));

  return { data: mapped, error: null };
}

// Helper: get first photo per review for a set of review ids
export async function getFirstPhotosForReviewIds(
  reviewIds: string[],
): Promise<
  Map<string, { id: string; file_path: string; alt_text?: string | null }>
> {
  if (!reviewIds.length) return new Map();
  const { data, error } = await supabase
    .from("review_photos")
    .select("id, review_id, file_path, alt_text, created_at")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const map = new Map<
    string,
    { id: string; file_path: string; alt_text?: string | null }
  >();
  for (const p of data || []) {
    if (!map.has(p.review_id)) {
      map.set(p.review_id, {
        id: p.id,
        file_path: p.file_path,
        alt_text: p.alt_text,
      });
    }
  }
  return map;
}

// Helper: get latest cover photo per place id for fallback
export async function getLatestCoverForPlaceIds(
  placeIds: string[],
): Promise<Map<string, string>> {
  if (!placeIds.length) return new Map();
  const { data, error } = await supabase
    .from("place_photos")
    .select("place_id, file_path, created_at")
    .in("place_id", placeIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const map = new Map<string, string>();
  for (const row of data || []) {
    const pid = row.place_id as string;
    if (!map.has(pid)) map.set(pid, row.file_path as string);
  }
  return map;
}

// Popular recent reviews (by reactions, then recency)
export async function getRecentReviewsPopular(days = 7, limit = 9) {
  const { data, error } = await supabase.rpc("recent_reviews_popular", {
    in_days: days,
    in_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

// Nearby recent reviews by coordinates (meters radius)
export async function getRecentReviewsNearby(
  lat: number,
  lon: number,
  radiusMeters = 5000,
  limit = 9,
) {
  const { data, error } = await supabase.rpc("recent_reviews_nearby", {
    in_lat: lat,
    in_lon: lon,
    in_radius_meters: radiusMeters,
    in_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

export async function getRecentReviewsFood(limit = 9) {
  const { data, error } = await supabase.rpc("recent_reviews_food", {
    in_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

// Nearby places using RPC
export async function getNearbyPlaces(
  lat: number,
  lon: number,
  radius = 5000,
  limit = 25,
): Promise<NearbyPlace[]> {
  const { data, error } = await supabase.rpc("search_places_nearby", {
    in_lat: lat,
    in_lon: lon,
    in_radius_meters: radius,
    in_max_results: limit,
  });

  if (error) throw error;
  return data || [];
}

// Search places by name or city
export async function searchPlaces(
  query: string,
  limit = 10,
): Promise<PlaceWithStats[]> {
  // Get places and stats in parallel
  const [placesResult, statsResult] = await Promise.all([
    supabase
      .from("places")
      .select(
        "id, name, slug, description, address_line1, address_line2, city, state, postal_code, country, phone, website_url, latitude, longitude, category_id, tags, business_hours, price_range, owner_id, is_active, created_at, updated_at",
      )
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(limit),
    supabase
      .from("place_stats")
      .select(
        "place_id, review_count, average_rating, last_reviewed_at, photo_count",
      ),
  ]);

  if (placesResult.error) throw placesResult.error;
  if (statsResult.error) throw statsResult.error;

  // Join places with their stats
  const placesWithStats = (placesResult.data || []).map((place) => ({
    ...place,
    place_stats:
      (statsResult.data || []).find((stat) => stat.place_id === place.id) ||
      undefined,
  }));

  // Sort in JavaScript
  const sortedData = placesWithStats
    .sort(
      (a, b) =>
        (b.place_stats?.average_rating || 0) -
        (a.place_stats?.average_rating || 0),
    )
    .slice(0, limit);

  return sortedData;
}

// Search history helpers
export async function getSearchHistory(limit = 8): Promise<SearchHistoryRow[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }
  const { data, error } = await supabase
    .from("search_history")
    .select("id, user_id, query, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    return [];
  }
  return (data || []) as SearchHistoryRow[];
}

export async function saveSearchQuery(queryText: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // Do nothing if not signed in
  await supabase
    .from("search_history")
    .upsert(
      { user_id: user.id, query: queryText },
      { onConflict: "user_id,query" },
    );
}
