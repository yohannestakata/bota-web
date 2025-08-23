"use client";

import { RatingStars } from "@/components/ui/rating-stars";

interface RatingBreakdownProps {
  reviews: Array<{
    rating: number;
  }>;
  averageRating: number;
  totalReviews: number;
}

export default function RatingBreakdown({
  reviews,
  averageRating,
  totalReviews,
}: RatingBreakdownProps) {
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // indices 0-4 for ratings 1-5

  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  const ratingPercentages = ratingCounts.map((count) =>
    totalReviews > 0 ? (count / totalReviews) * 100 : 0,
  );

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="flex gap-3.5">
          <div className="text-4xl font-medium">{averageRating.toFixed(1)}</div>
          <div className="mt-1 flex flex-col">
            <RatingStars rating={averageRating} size={16} />
            <span className="mt-0.5 text-sm">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingCounts[rating - 1];
          const percentage = ratingPercentages[rating - 1];

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-center font-medium">{rating}</span>
              <div className="bg-muted h-2 flex-1 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-muted-foreground w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
