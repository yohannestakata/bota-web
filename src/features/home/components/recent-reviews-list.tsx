import {
  getRecentReviews,
  getRecentReviewsNearby,
  getRecentReviewsPopular,
  getRecentReviewsFood,
} from "@/lib/supabase/queries";
// Server-only imports moved to parent server component
import RecentReviewItem from "./recent-review-item";
import { formatDistanceToNowStrict } from "date-fns";
import { RecentReviewEnriched } from "@/lib/types/database";

export default async function RecentReviewsList({
  filter,
  lat,
  lon,
  items,
}: {
  filter?: string;
  lat?: number;
  lon?: number;
  items?: RecentReviewEnriched[];
}) {
  let dataRows: RecentReviewEnriched[] = [];
  let error: unknown = null;

  try {
    if (items && items.length) {
      dataRows = items;
    } else {
      if (filter === "nearby" && lat != null && lon != null) {
        const LIMIT = 12;
        const radiusSteps = [5000, 7000, 10000, 15000];
        const seen = new Set<string>();
        const collected: RecentReviewEnriched[] = [];
        for (const radius of radiusSteps) {
          const batch = await getRecentReviewsNearby(lat, lon, radius, LIMIT);
          for (const row of batch) {
            const key = String(row.review_id);
            if (!seen.has(key)) {
              seen.add(key);
              collected.push(row);
            }
          }
          if (collected.length >= LIMIT) break;
        }
        // Sort by recency just in case mixed batches change order
        collected.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        dataRows = collected.slice(0, LIMIT);
      } else if (filter === "trending") {
        dataRows = await getRecentReviewsPopular(7, 12); // trending this week
      } else if (filter === "recent" || !filter) {
        // default: most recent overall
        dataRows = await getRecentReviews(12);
      } else {
        // fallback: most recent food places
        dataRows = await getRecentReviewsFood(12);
      }
    }
  } catch (e) {
    error = e;
    dataRows = await getRecentReviews(12);
  }

  // Server-side: fetch current user's reactions for these reviews
  const myReactionsMap = new Map<string, "like" | "love" | "meh" | "dislike">();

  const transformedReviews = dataRows.map(
    (
      review,
    ): {
      id: number;
      reviewId: string;
      placeSlug: string;
      authorHandle: string;
      place: string;
      category: string;
      rating: number;
      review: string;
      user: string;
      avatarUrl?: string;
      date: string;
      likes: number;
      loves: number;
      mehs: number;
      dislikes: number;
      myReaction: "like" | "love" | "meh" | "dislike" | null;
      comments: number;
      image: string;
      reviewPhotos: Array<{
        id: string;
        file_path: string;
        alt_text?: string;
        created_at: string;
      }>;
      branchPhotos: Array<{
        id: string;
        file_path: string;
        alt_text?: string;
        created_at: string;
      }>;
    } => {
      const placeName = review.place_name || "Restaurant Name";
      const category = review.category_name || "Restaurant";
      const userName =
        review.author_full_name || review.author_username || "User";
      const avatarUrl = review.author_avatar_url;

      const idStr = String(review.review_id ?? "");
      const rid = String(review.review_id ?? "");

      const myReaction =
        myReactionsMap.get(rid) ||
        (
          review as unknown as {
            my_reaction?: "like" | "love" | "meh" | "dislike" | null;
          }
        ).my_reaction ||
        null;

      return {
        id: idStr
          ? parseInt(idStr.replace(/-/g, "").substring(0, 8), 16)
          : Math.floor(Math.random() * 1e8),
        reviewId: rid,
        placeSlug: review.place_slug || "",
        authorHandle: review.author_username || review.author_id || "",
        place: placeName,
        category: category,
        rating: review.rating,
        review: review.body || "Great experience!",
        user: userName,
        avatarUrl: avatarUrl || undefined,
        date: formatDistanceToNowStrict(new Date(review.created_at), {
          addSuffix: true,
        }),
        likes: review.likes_count || 0,
        loves: review.loves_count || 0,
        mehs: review.mehs_count || 0,
        dislikes: review.dislikes_count || 0,
        myReaction,
        comments: 0, // TODO: Add comments table and count
        image:
          review.display_image ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        reviewPhotos: (review.review_photos || []).map(
          (photo: {
            id: string;
            file_path: string;
            alt_text?: string | null;
            created_at: string;
          }) => ({
            id: photo.id,
            file_path: photo.file_path,
            alt_text: photo.alt_text ?? undefined,
            created_at: photo.created_at,
          }),
        ),
        branchPhotos: (review.branch_photos || []).map(
          (photo: {
            id: string;
            file_path: string;
            alt_text?: string | null;
            created_at: string;
          }) => ({
            id: photo.id,
            file_path: photo.file_path,
            alt_text: photo.alt_text ?? undefined,
            created_at: photo.created_at,
          }),
        ),
      };
    },
  );

  return (
    <div className="mt-5 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {!!error ? (
        <div className="text-muted-foreground col-span-full text-center text-sm">
          Unable to load some review details. Showing cached/partial data.
        </div>
      ) : null}
      {transformedReviews.map((review) => (
        <RecentReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
