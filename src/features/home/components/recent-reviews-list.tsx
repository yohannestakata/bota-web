import {
  getRecentReviews,
  getRecentReviewsNearby,
  getRecentReviewsPopular,
  getRecentReviewsFood,
} from "@/lib/supabase/queries";
import RecentReviewItem from "./recent-review-item";
import { formatDistanceToNowStrict } from "date-fns";

export default async function RecentReviewsList({
  filter,
  lat,
  lon,
}: {
  filter?: string;
  lat?: number;
  lon?: number;
}) {
  type RecentReviewUnified = {
    id?: string;
    review_id?: string;
    place_id?: string;
    author_id?: string;
    rating: number;
    body?: string;
    created_at: string;
    place?: { name?: string; slug?: string };
    author?: { full_name?: string; username?: string; id?: string };
    place_name?: string;
    place_slug?: string;
    category_name?: string;
    author_username?: string;
    author_full_name?: string;
    review_stats?: {
      likes_count?: number;
      loves_count?: number;
      mehs_count?: number;
      dislikes_count?: number;
    };
  };

  let dataRows: RecentReviewUnified[] = [];
  let error: unknown = null;
  try {
    if (filter === "nearby" && lat != null && lon != null) {
      const LIMIT = 9;
      const radiusSteps = [5000, 7000, 10000, 15000];
      const seen = new Set<string>();
      const collected: RecentReviewUnified[] = [];
      for (const radius of radiusSteps) {
        const batch = await getRecentReviewsNearby(lat, lon, radius, LIMIT);
        for (const row of batch) {
          const key = String(row.id ?? row.review_id);
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
    } else if (filter === "popular") {
      dataRows = await getRecentReviewsPopular(7, 9); // popular this week
    } else if (filter === "recent" || !filter) {
      // default: most recent overall
      dataRows = (await getRecentReviews(9)).data as RecentReviewUnified[];
    } else {
      // fallback: most recent food places
      dataRows = await getRecentReviewsFood(9);
    }
  } catch (e) {
    error = e;
    dataRows = (await getRecentReviews(9)).data as RecentReviewUnified[];
  }

  // Transform the data to match the expected format
  const transformedReviews = dataRows.map((review) => {
    const placeName =
      review.place?.name || review.place_name || "Restaurant Name";
    const category = review.category_name || "Restaurant";
    const userName =
      review.author?.full_name ||
      review.author?.username ||
      review.author_full_name ||
      review.author_username ||
      "User";

    const idStr = String(review.id ?? review.review_id ?? "");
    return {
      id: idStr
        ? parseInt(idStr.replace(/-/g, "").substring(0, 8), 16)
        : Math.floor(Math.random() * 1e8),
      placeSlug: review.place?.slug || review.place_slug || "",
      authorHandle:
        review.author?.username ||
        review.author?.id ||
        review.author_username ||
        review.author_id ||
        "",
      place: placeName,
      category: category,
      rating: review.rating,
      review: review.body || "Great experience!",
      user: userName,
      date: formatDistanceToNowStrict(new Date(review.created_at), {
        addSuffix: true,
      }),
      likes: review.review_stats?.likes_count || 0,
      loves: review.review_stats?.loves_count || 0,
      mehs: review.review_stats?.mehs_count || 0,
      dislikes: review.review_stats?.dislikes_count || 0,
      comments: 0, // TODO: Add comments table and count
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // Placeholder
    };
  });

  return (
    <div className="mt-4 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
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
