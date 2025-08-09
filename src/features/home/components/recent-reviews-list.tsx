import { getRecentReviews } from "@/lib/supabase/queries";
import ReviewCard from "./review-card";

export default async function RecentReviewsList() {
  const { data: reviews, error } = await getRecentReviews(5);

  // Transform the data to match the expected format
  const transformedReviews = reviews.map((review) => {
    const placeName = review.place?.name || "Restaurant Name";
    const category = review.category_name || "Restaurant";
    const userName =
      review.author?.full_name || review.author?.username || "User";

    return {
      id: parseInt(review.id.replace(/-/g, "").substring(0, 8), 16), // Convert UUID to number
      place: placeName,
      category: category,
      rating: review.rating,
      review: review.body || review.title || "Great experience!",
      user: userName,
      date: new Date(review.created_at).toLocaleDateString(),
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
    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      {error ? (
        <div className="text-muted-foreground col-span-full text-center text-sm">
          Unable to load some review details. Showing cached/partial data.
        </div>
      ) : null}
      {transformedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
