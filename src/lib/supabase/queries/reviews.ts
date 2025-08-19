import { supabase } from "../client";
import type { Review } from "../client";

export type ReactionType = "like" | "love" | "meh" | "dislike" | null;

// Create a new review
export async function createReview(input: {
  branchId: string;
  rating: number;
  body?: string;
  visitedAt?: string;
}) {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      branch_id: input.branchId,
      rating: input.rating,
      body: input.body,
      visited_at: input.visitedAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get reviews for a place
export async function getReviewsForPlace(placeId: string, limit = 10) {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles!inner(
        id,
        username,
        full_name,
        avatar_url
      ),
      review_stats(
        total_reactions,
        likes_count,
        loves_count,
        mehs_count,
        dislikes_count
      )
    `,
    )
    .eq("branch_id", placeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Transform the data to match the expected format
  return (data || []).map((review) => ({
    ...review,
    author: review.profiles,
    review_stats: review.review_stats?.[0] || {
      total_reactions: 0,
      likes_count: 0,
      loves_count: 0,
      mehs_count: 0,
      dislikes_count: 0,
    },
  }));
}

// Get recent reviews
export async function getRecentReviews(limit = 9) {
  const { data, error } = await supabase
    .from("recent_reviews_enriched")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  console.log({ data });
  return data || [];
}

// Get recent reviews by popularity
export async function getRecentReviewsPopular(days = 7, limit = 9) {
  const { data, error } = await supabase.rpc("recent_reviews_popular", {
    in_days: days,
    in_limit: limit,
  });

  if (error) throw error;
  return data || [];
}

// Get recent reviews nearby
export async function getRecentReviewsNearby(
  latitude: number,
  longitude: number,
  radiusKm = 10,
  limit = 9,
) {
  const { data, error } = await supabase.rpc("recent_reviews_nearby", {
    in_lat: latitude,
    in_lon: longitude,
    in_radius_meters: radiusKm * 1000, // Convert km to meters
    in_limit: limit,
  });

  if (error) throw error;
  return data || [];
}

// Get recent reviews for food category
export async function getRecentReviewsFood(limit = 9) {
  const { data, error } = await supabase.rpc("recent_reviews_food", {
    in_limit: limit,
  });

  if (error) throw error;
  return data || [];
}

// Get reviews by author
export async function getReviewsByAuthor(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("reviews_with_my_reaction")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get replies for review IDs
export async function getRepliesForReviewIds(reviewIds: string[]): Promise<
  Map<
    string,
    Array<{
      id: string;
      body: string;
      created_at: string;
      updated_at: string;
      author_id: string;
      author: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
      };
    }>
  >
> {
  if (reviewIds.length === 0)
    return new Map<
      string,
      Array<{
        id: string;
        body: string;
        created_at: string;
        updated_at: string;
        author_id: string;
        author: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
      }>
    >();

  const { data, error } = await supabase
    .from("review_replies")
    .select(
      `
      id,
      review_id,
      body,
      created_at,
      updated_at,
      author_id,
      profiles!inner(
        id,
        username,
        full_name,
        avatar_url
      )
    `,
    )
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group replies by review_id
  const replyMap = new Map<
    string,
    Array<{
      id: string;
      body: string;
      created_at: string;
      updated_at: string;
      author_id: string;
      author: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
      };
    }>
  >();
  for (const reply of data || []) {
    if (!replyMap.has(reply.review_id)) {
      replyMap.set(reply.review_id, []);
    }
    const profile = reply.profiles as unknown as {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
    replyMap.get(reply.review_id)!.push({
      id: reply.id,
      body: reply.body,
      created_at: reply.created_at,
      updated_at: reply.updated_at,
      author_id: reply.author_id,
      author: {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
    });
  }

  return replyMap;
}

// Get review with details
export async function getReviewWithDetails(reviewId: string): Promise<
  | (Review & {
      author: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        created_at: string;
      };
      place: {
        id: string;
        name: string;
        slug: string;
        category_id: number | null;
        categories: {
          id: number;
          name: string;
          slug: string;
        } | null;
      };
      photos: Array<{
        id: string;
        file_path: string;
        alt_text: string | null;
        created_at: string;
      }>;
      replies: Array<{
        id: string;
        body: string;
        created_at: string;
        updated_at: string;
        author_id: string;
        profiles: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
      }>;
      reactions: {
        total_reactions: number;
        likes_count: number;
        loves_count: number;
        mehs_count: number;
        dislikes_count: number;
      };
    })
  | null
> {
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles!inner(
        id,
        username,
        full_name,
        avatar_url,
        created_at
      ),
      branches!inner(
        id,
        name,
        places!inner(
          id,
          name,
          slug,
          category_id,
          categories(id, name, slug)
        )
      )
    `,
    )
    .eq("id", reviewId)
    .single();

  if (reviewError) {
    if (reviewError.code === "PGRST116") return null;
    throw reviewError;
  }

  // Get photos
  const { data: photos, error: photosError } = await supabase
    .from("review_photos")
    .select("id, file_path, alt_text, created_at")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

  if (photosError) throw photosError;

  // Get replies
  const { data: replies, error: repliesError } = await supabase
    .from("review_replies")
    .select(
      `
      id,
      body,
      created_at,
      updated_at,
      author_id,
      profiles!inner(
        id,
        username,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

  if (repliesError) throw repliesError;

  // Get reactions
  const { data: reactions, error: reactionsError } = await supabase
    .from("review_reactions")
    .select("reaction_type, user_id")
    .eq("review_id", reviewId);

  if (reactionsError) throw reactionsError;

  // Count reactions by type
  const reactionCounts = {
    like: 0,
    love: 0,
    meh: 0,
    dislike: 0,
  };

  for (const reaction of reactions || []) {
    reactionCounts[reaction.reaction_type as keyof typeof reactionCounts]++;
  }

  return {
    ...review,
    author: review.profiles,
    place: {
      ...review.branches.places,
      category: review.branches.places.categories,
    },
    photos: photos || [],
    replies: (replies || []).map((reply) => ({
      ...reply,
      author: reply.profiles,
    })),
    reactions: reactionCounts,
  };
}

// Set review reaction
export async function setReviewReaction(input: {
  reviewId: string;
  reactionType: "like" | "love" | "meh" | "dislike" | null;
  userId?: string; // Allow passing userId directly
}) {
  const userId = input.userId || (await getCurrentUserId());
  if (!userId) throw new Error("User not authenticated");

  // Check if user exists in profiles table and create if missing
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    const { error: createError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: `user_${userId.substring(0, 8)}`,
        full_name: "User",
      })
      .select("id")
      .single();

    if (createError) {
      throw new Error("User profile not found and could not be created");
    }
  }

  // First, delete any existing reaction
  const { error: deleteError } = await supabase
    .from("review_reactions")
    .delete()
    .eq("review_id", input.reviewId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  // If reactionType is null, we're just removing the reaction
  if (input.reactionType === null) {
    return null;
  }

  // Then insert the new reaction
  const { data, error } = await supabase
    .from("review_reactions")
    .insert({
      review_id: input.reviewId,
      user_id: userId,
      reaction_type: input.reactionType,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user review stats
export async function getUserReviewStats(userId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  totalReactions: number;
  recentReviews: number;
}> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, created_at")
    .eq("author_id", userId);

  if (error) throw error;

  const reviews = data || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Get reactions received
  const { data: reactions, error: reactionsError } = await supabase
    .from("review_reactions")
    .select("review_id")
    .in(
      "review_id",
      reviews.map((r) => r.id),
    );

  if (reactionsError) throw reactionsError;

  const totalReactions = reactions?.length || 0;

  // Count recent reviews (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentReviews = reviews.filter(
    (r) => new Date(r.created_at) > thirtyDaysAgo,
  ).length;

  return {
    totalReviews,
    averageRating,
    totalReactions,
    recentReviews,
  };
}

// Helper function to get current user ID (client)
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getClaims();
    const sub = (data as unknown as { sub?: string })?.sub;
    if (sub) return sub;
  } catch {}
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// Get user reaction for a specific review
export async function getUserReactionForReview(
  reviewId: string,
): Promise<"like" | "love" | "meh" | "dislike" | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("review_reactions")
    .select("reaction_type")
    .eq("user_id", userId)
    .eq("review_id", reviewId)
    .maybeSingle();

  if (error || !data) return null;
  return data.reaction_type;
}
