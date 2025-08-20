import { format } from "date-fns";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewWithAuthor } from "@/lib/types/database";

interface TopReviewProps {
  review: ReviewWithAuthor;
}

export default function TopReview({ review }: TopReviewProps) {
  return (
    <div className="border-border mt-8 rounded-3xl border p-6">
      <div className="flex items-center gap-3.5">
        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full font-medium">
          {(review.author?.full_name || review.author?.username || "?")
            .toString()
            .trim()
            .charAt(0)
            .toUpperCase()}
        </div>
        <div>
          <div className="text-foreground font-semibold">
            {review.author?.full_name || review.author?.username || "User"}
          </div>
          <div className="mt-1 text-sm">
            {format(
              new Date(review.visited_at || review.created_at),
              "LLLL yyyy",
            )}
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {review.body ? (
          <p className="text-foreground mt-3 line-clamp-3 leading-relaxed">
            {review.body}
          </p>
        ) : null}
        <div className="mt-1 flex items-center gap-2">
          <RatingStars rating={review.rating} size={16} />
          <span className="text-sm font-medium">{review.rating}</span>
        </div>
        <div className="mt-3">
          <a
            href="#reviews"
            className="font-semibold underline underline-offset-4"
          >
            Read the full review
          </a>
        </div>
      </div>
    </div>
  );
}
