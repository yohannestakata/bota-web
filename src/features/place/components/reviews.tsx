import ReviewsClient, { type ReviewItemProps } from "./reviews.client";
import {
  getRepliesForReviewIds,
  getReviewsForPlace,
} from "@/lib/supabase/queries";

export default async function Reviews({
  placeId,
  reviews,
}: {
  placeId?: string;
  reviews?: ReviewItemProps["review"][];
}) {
  // If reviews are provided, use them; otherwise fetch from placeId
  if (reviews) {
    return <ReviewsClient reviews={reviews} />;
  }

  if (!placeId) {
    return <div className="text-muted-foreground">No reviews available.</div>;
  }

  console.log("[Reviews] Fetching reviews for placeId:", placeId);

  const placeReviews = await getReviewsForPlace(placeId, 8).catch(() => []);
  console.log(
    "[Reviews] Reviews fetched:",
    JSON.stringify(placeReviews, null, 2),
  );

  type ReplyBasic = {
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
  };

  const repliesMap: Map<string, ReplyBasic[]> = await getRepliesForReviewIds(
    placeReviews.map((r) => r.id),
  ).catch(() => new Map<string, ReplyBasic[]>());

  const reviewsWithReplies: ReviewItemProps["review"][] = placeReviews.map(
    (r) => ({
      ...r,
      replies: (repliesMap.get(r.id) || []) as unknown as NonNullable<
        ReviewItemProps["review"]["replies"]
      >,
    }),
  );

  return <ReviewsClient reviews={reviewsWithReplies} />;
}
