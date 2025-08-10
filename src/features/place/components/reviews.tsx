import ReviewsClient, { type ReviewItemProps } from "./reviews.client";
import {
  getRepliesForReviewIds,
  getReviewsForPlace,
} from "@/lib/supabase/queries";

export default async function Reviews({ placeId }: { placeId: string }) {
  const placeReviews = await getReviewsForPlace(placeId, 8).catch(() => []);
  const repliesMap = await getRepliesForReviewIds(
    placeReviews.map((r) => r.id),
  ).catch(() => new Map());
  const reviewsWithReplies: ReviewItemProps["review"][] = placeReviews.map(
    (r) => ({
      ...r,
      replies: repliesMap.get(r.id) || [],
    }),
  );

  return <ReviewsClient reviews={reviewsWithReplies} />;
}
