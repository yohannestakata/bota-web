import { supabase } from "../client";
import type { ReviewPhoto } from "../client";

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

// Get photo categories for a specific place
export async function getPlacePhotoCategories(placeId: string) {
  const { data, error } = await supabase
    .from("photo_categories")
    .select(
      `
      id,
      name,
      branch_photos!inner(
        id,
        file_path,
        alt_text,
        photo_category_id,
        created_at
      )
    `,
    )
    .eq("branch_photos.branch_id", placeId)
    .order("name");

  if (error) throw error;
  return data || [];
}

// Get photos for a place with optional category filter
export async function getPlacePhotos(
  placeId: string,
  limit = 12,
  categoryId?: number,
) {
  let query = supabase
    .from("branch_photos")
    .select(
      `
      id,
      file_path,
      alt_text,
      photo_category_id,
      created_at,
      photo_categories(id, name)
    `,
    )
    .eq("branch_id", placeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq("photo_category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Upload a photo for a place
export async function uploadPlacePhoto(input: {
  branchId: string;
  filePath: string;
  altText?: string;
  photoCategoryId?: number;
}) {
  const { data, error } = await supabase
    .from("branch_photos")
    .insert({
      branch_id: input.branchId,
      file_path: input.filePath,
      alt_text: input.altText,
      photo_category_id: input.photoCategoryId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Upload a photo for a review
export async function uploadReviewPhoto(input: {
  reviewId: string;
  filePath: string;
  altText?: string;
  photoCategoryId?: number;
}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("review_photos")
    .insert({
      review_id: input.reviewId,
      author_id: user.id,
      file_path: input.filePath,
      alt_text: input.altText,
      photo_category_id: input.photoCategoryId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get first photo for each review ID
export async function getFirstPhotosForReviewIds(
  reviewIds: string[],
): Promise<ReviewPhoto[]> {
  if (reviewIds.length === 0) return [];

  const { data, error } = await supabase
    .from("review_photos")
    .select("id, review_id, author_id, file_path, alt_text, created_at")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Get first photo for each review
  const photoMap = new Map<string, ReviewPhoto>();
  for (const photo of data || []) {
    if (!photoMap.has(photo.review_id)) {
      photoMap.set(photo.review_id, photo);
    }
  }

  return Array.from(photoMap.values());
}

// Get latest cover photo for place IDs
export async function getLatestCoverForPlaceIds(
  placeIds: string[],
): Promise<{ place_id: string; file_path: string }[]> {
  if (placeIds.length === 0) return [];

  // Get the main branch for each place, then get photos for those branches
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id, place_id")
    .in("place_id", placeIds)
    .eq("is_main_branch", true);

  if (branchesError) throw branchesError;

  const branchIds = (branches || []).map((b) => b.id);
  if (branchIds.length === 0) return [];

  const { data, error } = await supabase
    .from("branch_photos")
    .select("branch_id, file_path, created_at")
    .in("branch_id", branchIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Create a map from branch_id to place_id
  const branchToPlaceMap = new Map(
    (branches || []).map((b) => [b.id, b.place_id]),
  );

  // Get latest photo for each place
  const photoMap = new Map<string, { place_id: string; file_path: string }>();
  for (const photo of data || []) {
    const placeId = branchToPlaceMap.get(photo.branch_id);
    if (placeId && !photoMap.has(placeId)) {
      photoMap.set(placeId, {
        place_id: placeId,
        file_path: photo.file_path,
      });
    }
  }

  return Array.from(photoMap.values());
}

// Get photos uploaded by a specific user (author)
export async function getPhotosByAuthor(
  authorId: string,
  limit = 24,
  offset = 0,
): Promise<
  Array<{
    id: string;
    file_path: string;
    alt_text?: string | null;
    created_at: string;
    review_id?: string;
  }>
> {
  const { data, error } = await supabase
    .from("review_photos")
    .select("id, file_path, alt_text, created_at, review_id")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []) as Array<{
    id: string;
    file_path: string;
    alt_text?: string | null;
    created_at: string;
    review_id?: string;
  }>;
}
