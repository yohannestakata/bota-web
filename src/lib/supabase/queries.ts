import { supabase } from "./client";
import type {
  Place,
  PlaceWithStats,
  FeaturedPlace,
  Category,
  Review,
  MenuItem,
  PlacePhoto,
  MenuItemPhoto,
  ReviewPhoto,
  ReviewStats,
  NearbyPlace,
  CuisineType,
  Profile,
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
      id, place_id, author_id, rating, title, body, visited_at, owner_response, 
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

// Featured places using materialized view with hybrid scoring algorithm
export async function getFeaturedPlaces(limit = 6): Promise<FeaturedPlace[]> {
  const { data, error } = await supabase
    .from("featured_places")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Recent reviews with stats, place, and author details
export async function getRecentReviews(limit = 5): Promise<
  (Review & {
    review_stats?: ReviewStats;
    place?: Partial<Place>;
    author?: Partial<Profile>;
  })[]
> {
  // Get reviews first
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      id, place_id, author_id, title, body, rating, visited_at, owner_response, 
      owner_response_at, owner_response_by, created_at, updated_at
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reviewsError) throw reviewsError;

  // Get places and profiles separately to avoid relationship conflicts
  const placeIds = [...new Set(reviews?.map((r) => r.place_id) || [])];
  const authorIds = [...new Set(reviews?.map((r) => r.author_id) || [])];

  const [placesResult, profilesResult, statsResult] = await Promise.all([
    supabase
      .from("places")
      .select("id, name, slug, category_id, created_at")
      .in("id", placeIds),
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, created_at")
      .in("id", authorIds),
    supabase
      .from("review_stats")
      .select(
        "review_id, total_reactions, likes_count, loves_count, mehs_count, dislikes_count",
      ),
  ]);

  if (placesResult.error) throw placesResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (statsResult.error) throw statsResult.error;

  // Join reviews with their related data
  const reviewsWithStats = (reviews || []).map((review) => ({
    ...review,
    place: placesResult.data?.find((p) => p.id === review.place_id),
    author: profilesResult.data?.find((p) => p.id === review.author_id),
    review_stats:
      statsResult.data?.find((stat) => stat.review_id === review.id) ||
      undefined,
  }));

  return reviewsWithStats;
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
