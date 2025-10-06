import { supabase } from "../client";
import type { PlaceWithStats, Category, NearbyPlace } from "../client";

// Get place with category and stats (legacy - use getPlaceWithFullDetails instead)
export async function getPlaceWithDetails(
  placeId: string,
): Promise<PlaceWithStats & { category?: Category }> {
  const { data: place, error: placeError } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, category_id, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("id", placeId)
    .single();

  if (placeError) throw placeError;

  // Get stats from branch_stats for the main branch
  const { data: stats, error: statsError } = await supabase
    .from("branch_stats")
    .select("review_count, average_rating, last_reviewed_at, photo_count")
    .eq("branch_id", placeId)
    .single();

  if (statsError && statsError.code !== "PGRST116") throw statsError;

  return {
    ...place,
    ...stats,
    category: place.categories?.[0],
  };
}

// Get place by slug with details (legacy - use getPlaceWithFullDetails instead)
export async function getPlaceBySlugWithDetails(
  slug: string,
): Promise<(PlaceWithStats & { category?: Category }) | null> {
  const { data: branch, error } = await supabase
    .from("branches_with_details")
    .select("*")
    .eq("place_slug", slug)
    .eq("is_main_branch", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  // Transform to match PlaceWithStats & { category?: Category } interface
  const placeStats = {
    branch_id: branch.branch_id || branch.place_id, // Use branch_id if available, otherwise place_id
    review_count: branch.review_count,
    average_rating: branch.average_rating,
    last_reviewed_at:
      branch.last_reviewed_at === null ? undefined : branch.last_reviewed_at,
    photo_count: branch.photo_count,
  };

  return {
    id: branch.place_id,
    branch_id: branch.branch_id, // Add branch_id for review creation
    name: branch.place_name,
    slug: branch.place_slug,
    description: branch.place_description,
    category_id: branch.category_id,
    tags: branch.tags,
    owner_id: branch.owner_id,
    is_active: branch.place_is_active,
    created_at: branch.place_created_at,
    updated_at: branch.place_updated_at,
    place_stats: {
      review_count: placeStats.review_count,
      average_rating: placeStats.average_rating,
      last_reviewed_at: placeStats.last_reviewed_at,
      photo_count: placeStats.photo_count,
    },
    category: branch.category_name
      ? {
          id: branch.category_id,
          name: branch.category_name,
          slug: branch.category_slug,
          description: branch.category_description,
          icon_name: branch.category_icon,
          created_at: branch.place_created_at, // Using place created_at as fallback
        }
      : undefined,
  };
}

// Comprehensive place details type
export type PlaceWithFullDetails = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  tags: string[] | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Branch data (from main branch or specific branch)
  branch_id?: string;
  price_range: number | null;
  phone: string | null;
  website_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: Record<string, unknown> | null;
  // Category data
  category_name: string | null;
  category_slug: string | null;
  category_description: string | null;
  category_icon: string | null;
  // Stats data
  review_count: number | null;
  average_rating: number | null;
  last_reviewed_at: string | null;
  photo_count: number | null;
  // Hours data
  hours: Array<{
    day_of_week: number;
    open_time?: string | null;
    close_time?: string | null;
    is_closed: boolean;
    is_24_hours: boolean;
  }>;
  // Top review data
  top_review: {
    id: string;
    rating: number;
    body?: string | null;
    visited_at?: string | null;
    created_at: string;
    author: {
      id: string;
      username?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    };
    stats: {
      total_reactions: number;
      likes_count: number;
      loves_count: number;
      mehs_count: number;
      dislikes_count: number;
    };
  } | null;
  // Branches data
  branches: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    phone?: string | null;
    website_url?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    is_main_branch: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  // Amenities data
  amenities: Array<{
    amenity_type_id: number;
    value: boolean;
    amenity: {
      id: number;
      key: string;
      name: string;
      icon_name?: string | null;
    };
  }>;
  // Menu data
  menu: {
    sections: Array<{
      id: string;
      name: string;
      description?: string | null;
      icon_name?: string | null;
    }>;
    items: Array<{
      id: string;
      section_id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      currency?: string | null;
      is_available: boolean;
      position?: number | null;
      created_at: string;
    }>;
  };
};

// Get comprehensive place details using the branches_with_details view
export async function getPlaceWithFullDetails(
  slug: string,
): Promise<PlaceWithFullDetails | null> {
  const { data: branch, error } = await supabase
    .from("branches_with_details")
    .select("*")
    .eq("place_slug", slug)
    .eq("is_main_branch", true)
    .single();

  console.log({ slug });
  console.log({ branch });

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    id: branch.place_id,
    name: branch.place_name,
    slug: branch.place_slug,
    description: branch.place_description,
    category_id: branch.category_id,
    tags: branch.tags,
    owner_id: branch.owner_id,
    is_active: branch.place_is_active,
    created_at: branch.place_created_at,
    updated_at: branch.place_updated_at,
    // Branch data
    price_range: branch.price_range,
    phone: branch.branch_phone,
    website_url: branch.branch_website_url,
    address_line1: branch.branch_address_line1,
    address_line2: branch.branch_address_line2,
    city: branch.branch_city,
    state: branch.branch_state,
    postal_code: branch.branch_postal_code,
    country: branch.branch_country,
    latitude: branch.branch_latitude,
    longitude: branch.branch_longitude,
    business_hours: branch.branch_business_hours,
    // Category data
    category_name: branch.category_name,
    category_slug: branch.category_slug,
    category_description: branch.category_description,
    category_icon: branch.category_icon,
    // Stats data
    review_count: branch.review_count,
    average_rating: branch.average_rating,
    last_reviewed_at: branch.last_reviewed_at,
    photo_count: branch.photo_count,
    // Hours data
    hours: branch.hours || [],
    // Top review data
    top_review: branch.top_review,
    // Branches data
    branches: branch.other_branches || [],
    // Amenities data
    amenities: branch.amenities || [],
    // Menu data
    menu: branch.menu || [],
  };
}

// Comprehensive place page data type
export type PlacePageData = {
  place: PlaceWithFullDetails;
  photo_categories: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  photos: Array<{
    id: string;
    file_path: string;
    alt_text?: string | null;
    photo_category_id?: number | null;
    created_at: string;
    photo_categories?: {
      id: number;
      name: string;
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    body?: string | null;
    visited_at?: string | null;
    created_at: string;
    author: {
      id: string;
      username?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    };
    stats: {
      total_reactions: number;
      likes_count: number;
      loves_count: number;
      mehs_count: number;
      dislikes_count: number;
    };
    photos: Array<{
      id: string;
      file_path: string;
      alt_text?: string | null;
      created_at: string;
    }>;
    replies: Array<{
      id: string;
      body: string;
      created_at: string;
      is_owner: boolean;
      author: {
        id: string;
        username?: string | null;
        full_name?: string | null;
        avatar_url?: string | null;
      };
    }>;
  }>;
  similar_places: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    category_id?: number | null;
    tags?: string[] | null;
    created_at: string;
    updated_at: string;
    category?: {
      id: number;
      name: string;
      slug: string;
      description?: string | null;
      icon_name?: string | null;
    };
    stats: {
      review_count: number;
      average_rating?: number | null;
      last_reviewed_at?: string | null;
      photo_count: number;
    };
  }>;
};

// Get comprehensive place page data using RPC function
export async function getPlacePageData(
  placeSlug: string,
  branchSlug: string | null,
  options?: {
    photoLimit?: number;
    photoCategoryId?: number;
    reviewLimit?: number;
    similarLimit?: number;
  },
): Promise<PlacePageData | null> {
  console.log(
    "getPlacePageData called with placeSlug:",
    placeSlug,
    "branchSlug:",
    branchSlug,
  );

  // Test if place exists with old function for comparison
  try {
    const oldPlace = await getPlaceWithFullDetails(placeSlug);
    console.log("Old function result:", oldPlace ? "Found" : "Not found");
  } catch (e) {
    console.log("Old function error:", e);
  }

  const { data, error } = await supabase.rpc("get_place_page_data", {
    in_place_slug: placeSlug,
    in_branch_slug: branchSlug,
    in_photo_limit: options?.photoLimit ?? 12,
    in_photo_category_id: options?.photoCategoryId ?? null,
    in_review_limit: options?.reviewLimit ?? 10,
    in_similar_limit: options?.similarLimit ?? 6,
    // user injected at the page level using SSR client (leave null here)
    in_user: null,
  });

  console.log("RPC response:", { data, error });

  if (error) {
    console.error("RPC error:", error);
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as PlacePageData;
}

// Comprehensive branch details type
export type BranchWithDetails = {
  id: string;
  place_id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  website_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: Record<string, unknown> | null;
  price_range: number | null;
  is_main_branch: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Place data
  place_name: string;
  place_slug: string;
  place_description: string | null;
  place_category_id: number | null;
  place_tags: string[] | null;
  place_is_active: boolean;
  place_created_at: string;
  place_updated_at: string;
  place_owner_id: string;
  // Category data
  category_name: string | null;
  category_slug: string | null;
  category_description: string | null;
  category_icon: string | null;
  // Stats data
  review_count: number | null;
  average_rating: number | null;
  last_reviewed_at: string | null;
  photo_count: number | null;
  // Hours data
  hours: Array<{
    day_of_week: number;
    open_time?: string | null;
    close_time?: string | null;
    is_closed: boolean;
    is_24_hours: boolean;
  }>;
  // Top review data
  top_review: {
    id: string;
    rating: number;
    body?: string | null;
    visited_at?: string | null;
    created_at: string;
    author: {
      id: string;
      username?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    };
    stats: {
      total_reactions: number;
      likes_count: number;
      loves_count: number;
      mehs_count: number;
      dislikes_count: number;
    };
  } | null;
  // Amenities data
  amenities: Array<{
    amenity_type_id: number;
    value: boolean;
    amenity: {
      id: number;
      key: string;
      name: string;
      icon_name?: string | null;
    };
  }>;
  // Menu data
  menu: {
    sections: Array<{
      id: string;
      name: string;
      description?: string | null;
      icon_name?: string | null;
    }>;
    items: Array<{
      id: string;
      section_id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      currency?: string | null;
      is_available: boolean;
      position?: number | null;
      created_at: string;
    }>;
  };
};

// Get branch by slug
export async function getBranchBySlug(
  placeSlug: string,
  branchSlug: string,
): Promise<BranchWithDetails | null> {
  const { data: branch, error } = await supabase
    .from("branches_with_details")
    .select("*")
    .eq("place_slug", placeSlug)
    .eq("branch_slug", branchSlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    id: branch.branch_id,
    place_id: branch.place_id,
    name: branch.branch_name,
    slug: branch.branch_slug,
    description: branch.branch_description,
    phone: branch.branch_phone,
    website_url: branch.branch_website_url,
    address_line1: branch.branch_address_line1,
    address_line2: branch.branch_address_line2,
    city: branch.branch_city,
    state: branch.branch_state,
    postal_code: branch.branch_postal_code,
    country: branch.branch_country,
    latitude: branch.branch_latitude,
    longitude: branch.branch_longitude,
    business_hours: branch.branch_business_hours,
    price_range: branch.price_range,
    is_main_branch: branch.is_main_branch,
    is_active: branch.branch_is_active,
    created_at: branch.branch_created_at,
    updated_at: branch.branch_updated_at,
    // Place data
    place_name: branch.place_name,
    place_slug: branch.place_slug,
    place_description: branch.place_description,
    place_category_id: branch.category_id,
    place_tags: branch.tags,
    place_is_active: branch.place_is_active,
    place_created_at: branch.place_created_at,
    place_updated_at: branch.place_updated_at,
    place_owner_id: branch.owner_id,
    // Category data
    category_name: branch.category_name,
    category_slug: branch.category_slug,
    category_description: branch.category_description,
    category_icon: branch.category_icon,
    // Stats data
    review_count: branch.review_count,
    average_rating: branch.average_rating,
    last_reviewed_at: branch.last_reviewed_at,
    photo_count: branch.photo_count,
    // Hours data
    hours: branch.hours || [],
    // Top review data
    top_review: branch.top_review,
    // Amenities data
    amenities: branch.amenities || [],
    // Menu data
    menu: branch.menu || [],
  };
}

// Get places with pagination
export async function getPlaces(limit = 20): Promise<PlaceWithStats[]> {
  const { data, error } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, category_id, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get main branch IDs for all places
  const placeIds = (data || []).map((p) => p.id);
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);

  if (branchesError) throw branchesError;

  // Create a map of place_id to branch_id
  const branchMap = new Map((branches || []).map((b) => [b.place_id, b.id]));

  // Get stats for all main branches
  const branchIds = (branches || []).map((b) => b.id);
  const { data: stats, error: statsError } = await supabase
    .from("branch_stats")
    .select(
      "branch_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .in("branch_id", branchIds);

  if (statsError) throw statsError;

  // Create a map of branch_id to stats
  const statsMap = new Map((stats || []).map((s) => [s.branch_id, s]));

  return (data || []).map((place) => {
    const branchId = branchMap.get(place.id);
    const placeStats = branchId ? statsMap.get(branchId) : null;

    return {
      ...place,
      place_stats: placeStats
        ? {
            review_count: placeStats.review_count,
            average_rating: placeStats.average_rating,
            last_reviewed_at: placeStats.last_reviewed_at,
            photo_count: placeStats.photo_count,
          }
        : undefined,
      category: place.categories,
    };
  });
}

// Get places by category
export async function getPlacesByCategory(
  categoryId: number,
  limit = 20,
): Promise<PlaceWithStats[]> {
  const { data, error } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, category_id, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get main branch IDs for all places
  const placeIds = (data || []).map((p) => p.id);
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);

  if (branchesError) throw branchesError;

  // Create a map of place_id to branch_id
  const branchMap = new Map((branches || []).map((b) => [b.place_id, b.id]));

  // Get stats for all main branches
  const branchIds = (branches || []).map((b) => b.id);
  const { data: stats, error: statsError } = await supabase
    .from("branch_stats")
    .select(
      "branch_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .in("branch_id", branchIds);

  if (statsError) throw statsError;

  // Create a map of branch_id to stats
  const statsMap = new Map((stats || []).map((s) => [s.branch_id, s]));

  return (data || []).map((place) => {
    const branchId = branchMap.get(place.id);
    const placeStats = branchId ? statsMap.get(branchId) : null;

    return {
      ...place,
      place_stats: placeStats
        ? {
            review_count: placeStats.review_count,
            average_rating: placeStats.average_rating,
            last_reviewed_at: placeStats.last_reviewed_at,
            photo_count: placeStats.photo_count,
          }
        : undefined,
      category: place.categories,
    };
  });
}

// Get places by category with pagination
export async function getPlacesByCategoryPaged(
  categoryId: number,
  page = 1,
  pageSize = 20,
  sort: "rating" | "recent" = "rating",
): Promise<{ places: PlaceWithStats[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get total count of active places in category
  const { count, error: countError } = await supabase
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (countError) throw countError;

  // Fetch sorted page using branches_with_details for main branches
  let query = supabase
    .from("branches_with_details")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_main_branch", true)
    .eq("place_is_active", true)
    .eq("branch_is_active", true);

  if (sort === "rating") {
    query = query
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("place_created_at", { ascending: false });
  } else {
    query = query
      .order("last_reviewed_at", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("place_created_at", { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) throw error;

  type BranchesWithDetailsListRow = {
    place_id: string;
    place_name: string;
    place_slug: string;
    place_description: string | null;
    category_id: number | null;
    owner_id: string;
    place_is_active: boolean;
    place_created_at: string;
    place_updated_at: string;
    review_count: number | null;
    average_rating: number | null;
    last_reviewed_at: string | null;
    photo_count: number | null;
  };

  const places: PlaceWithStats[] = (data || []).map(
    (row: BranchesWithDetailsListRow) => ({
      id: row.place_id,
      name: row.place_name,
      slug: row.place_slug,
      description: row.place_description ?? undefined,
      category_id: row.category_id ?? undefined,
      owner_id: row.owner_id,
      is_active: row.place_is_active,
      created_at: row.place_created_at,
      updated_at: row.place_updated_at,
      place_stats: {
        review_count: row.review_count ?? 0,
        average_rating: row.average_rating ?? 0,
        last_reviewed_at: row.last_reviewed_at ?? undefined,
        photo_count: row.photo_count ?? 0,
      },
    }),
  );

  return { places, total: count || 0 };
}

// Get similar places
export async function getSimilarPlaces(
  categoryId: number,
  excludePlaceId: string,
  limit = 6,
): Promise<PlaceWithStats[]> {
  const { data, error } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, category_id, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludePlaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get main branch IDs for all places
  const placeIds = (data || []).map((p) => p.id);
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);

  if (branchesError) throw branchesError;

  // Create a map of place_id to branch_id
  const branchMap = new Map((branches || []).map((b) => [b.place_id, b.id]));

  // Get stats for all main branches
  const branchIds = (branches || []).map((b) => b.id);
  const { data: stats, error: statsError } = await supabase
    .from("branch_stats")
    .select(
      "branch_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .in("branch_id", branchIds);

  if (statsError) throw statsError;

  // Create a map of branch_id to stats
  const statsMap = new Map((stats || []).map((s) => [s.branch_id, s]));

  return (data || []).map((place) => {
    const branchId = branchMap.get(place.id);
    const placeStats = branchId ? statsMap.get(branchId) : null;

    return {
      ...place,
      place_stats: placeStats
        ? {
            review_count: placeStats.review_count,
            average_rating: placeStats.average_rating,
            last_reviewed_at: placeStats.last_reviewed_at,
            photo_count: placeStats.photo_count,
          }
        : undefined,
      category: place.categories,
    };
  });
}

// Get nearby places
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radiusKm = 10,
  limit = 20,
): Promise<NearbyPlace[]> {
  const { data, error } = await supabase.rpc("search_places_nearby", {
    lat: latitude,
    lng: longitude,
    radius_km: radiusKm,
    max_results: limit,
  });

  if (error) throw error;
  return data || [];
}

// Search places
export async function searchPlaces(
  query: string,
  limit = 20,
): Promise<PlaceWithStats[]> {
  const { data, error } = await supabase
    .from("places")
    .select(
      `
      id, name, slug, description, category_id, 
      owner_id, is_active, created_at, updated_at,
      categories(id, name, slug, description, icon_name, created_at)
    `,
    )
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get main branch IDs for all places
  const placeIds = (data || []).map((p) => p.id);
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);

  if (branchesError) throw branchesError;

  // Create a map of place_id to branch_id
  const branchMap = new Map((branches || []).map((b) => [b.place_id, b.id]));

  // Get stats for all main branches
  const branchIds = (branches || []).map((b) => b.id);
  const { data: stats, error: statsError } = await supabase
    .from("branch_stats")
    .select(
      "branch_id, review_count, average_rating, last_reviewed_at, photo_count",
    )
    .in("branch_id", branchIds);

  if (statsError) throw statsError;

  // Create a map of branch_id to stats
  const statsMap = new Map((stats || []).map((s) => [s.branch_id, s]));

  return (data || []).map((place) => {
    const branchId = branchMap.get(place.id);
    const placeStats = branchId ? statsMap.get(branchId) : null;

    return {
      ...place,
      place_stats: placeStats
        ? {
            review_count: placeStats.review_count,
            average_rating: placeStats.average_rating,
            last_reviewed_at: placeStats.last_reviewed_at,
            photo_count: placeStats.photo_count,
          }
        : undefined,
      category: place.categories,
    };
  });
}

// Search branches (used by web search bars)
export async function searchBranches(
  query: string,
  limit = 20,
): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    place_slug: string;
  }>
> {
  const q = query.trim();
  if (!q) return [];

  // First: find matching branches
  const { data: branches, error: branchesErr } = await supabase
    .from("branches")
    .select("id, name, slug, city, place_id, is_active")
    .or(`name.ilike.%${q}%,city.ilike.%${q}%`)
    .eq("is_active", true)
    .limit(limit);

  if (branchesErr) throw branchesErr;
  const branchRows = (branches || []) as Array<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    place_id: string;
  }>;

  if (branchRows.length === 0) return [];

  // Then: fetch place slugs for those branches
  const placeIds = Array.from(new Set(branchRows.map((b) => b.place_id)));
  const { data: places, error: placesErr } = await supabase
    .from("places")
    .select("id, slug")
    .in("id", placeIds);
  if (placesErr) throw placesErr;
  const placeSlugById = new Map(
    (places || []).map((p: { id: string; slug: string }) => [p.id, p.slug]),
  );

  return branchRows
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city ?? null,
      place_slug: placeSlugById.get(b.place_id) || "",
    }))
    .filter((r) => r.place_slug);
}

// Unified search by place context (place name, categories, tags) returning branches
export async function searchBranchesFromPlaceQuery(
  query: string,
  limit = 20,
): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    place_slug: string;
  }>
> {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabase.rpc("search_branches", {
    q,
    max_results: limit,
  });
  if (error) throw error;
  const rows = (data || []) as Array<{
    branch_id: string;
    branch_name: string;
    branch_slug: string;
    branch_city: string | null;
    place_slug: string;
    place_name: string;
  }>;

  return rows.map((r) => ({
    id: r.branch_id,
    name: r.branch_name,
    slug: r.branch_slug,
    city: r.branch_city,
    place_slug: r.place_slug,
    // include place_name in the object for UI display
    // Type remains compatible with callers selecting fields they need
    place_name: r.place_name,
  }));
}

// Fetch a branch by its slug only, including parent place slug and name
export async function getPlaceAndBranchByBranchSlug(
  branchSlug: string,
): Promise<{
  branch: { id: string; name: string; slug: string; isMain: boolean };
  place: { id: string; name: string; slug: string };
} | null> {
  const { data, error } = await supabase
    .from("branches")
    .select(
      `id, name, slug, is_main_branch, place_id, places:place_id ( id, name, slug, is_active )`,
    )
    .eq("slug", branchSlug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    name: string;
    slug: string;
    is_main_branch: boolean;
    place_id: string;
    places: {
      id: string;
      name: string;
      slug: string;
      is_active: boolean;
    } | null;
  };
  if (!row.places || row.places.is_active === false)
    return {
      branch: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        isMain: !!row.is_main_branch,
      },
      place: { id: row.place_id, name: "", slug: "" },
    };
  return {
    branch: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      isMain: !!row.is_main_branch,
    },
    place: { id: row.places.id, name: row.places.name, slug: row.places.slug },
  };
}

// Get all active place slugs for sitemap
export async function getAllActivePlaceSlugs(
  limitPerPage = 1000,
): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from("places")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(limitPerPage);

  if (error) throw error;
  return data || [];
}

// Get all active branch slugs for sitemap
export async function getAllActiveBranchSlugs(
  limitPerPage = 1000,
): Promise<{ place_slug: string; branch_slug: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from("branches_with_details")
    .select(
      "place_slug, branch_slug, branch_updated_at, average_rating, review_count, is_main_branch",
    )
    .eq("branch_is_active", true)
    .eq("place_is_active", true)
    .eq("is_main_branch", false)
    .order("average_rating", { ascending: false, nullsFirst: false })
    .order("review_count", { ascending: false, nullsFirst: false })
    .order("branch_updated_at", { ascending: false })
    .limit(limitPerPage);

  if (error) throw error;
  return (data || []).map((b) => ({
    place_slug: (b as { place_slug: string }).place_slug,
    branch_slug: (b as { branch_slug: string }).branch_slug,
    updated_at: (b as { branch_updated_at: string }).branch_updated_at,
  }));
}

// Flat list of menu items for a place (id + name)
export async function getMenuItemsForPlace(
  placeId: string,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name")
    .eq("branch_id", placeId)
    .order("name");
  if (error) throw error;
  return (data || []) as { id: string; name: string }[];
}
