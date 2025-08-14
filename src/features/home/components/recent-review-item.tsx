import Image from "next/image";
import { RatingStars } from "@/components/ui/rating-stars";
import Link from "next/link";
import { User } from "lucide-react";
import ReviewReactions from "@/features/reviews/components/review-reactions.client";

export interface RecentReviewItemData {
  id: number;
  reviewId?: string;
  myReaction?: "like" | "love" | "meh" | "dislike" | null;
  placeSlug?: string;
  authorHandle?: string;
  avatarUrl?: string;
  place: string;
  category: string;
  rating: number;
  review: string;
  user: string;
  date: string;
  likes: number;
  loves: number;
  mehs: number;
  dislikes: number;
  comments: number;
  image: string;
}

export default function RecentReviewItem({
  review,
}: {
  review: RecentReviewItemData;
}) {
  return (
    <div className="border-border rounded-3xl border p-6">
      <div className="mt-2 flex items-center gap-3.5">
        <div className="bg-muted relative size-12 overflow-hidden rounded-full">
          {review.avatarUrl ? (
            <Image
              src={review.avatarUrl}
              alt={review.user}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <User size={12} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <Link
            href={review.authorHandle ? `/profile/${review.authorHandle}` : "#"}
            className="font-semibold underline-offset-4 hover:underline"
          >
            {review.user}
          </Link>
          <div className="text-sm">{review.date}</div>
        </div>
      </div>

      <div className="relative mt-3 aspect-video w-full rounded-3xl">
        <Image
          src={review.image}
          alt={review.place}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="rounded-lg object-cover"
          unoptimized={false}
        />
      </div>

      <div className="mt-3 flex-1">
        <div className="flex flex-col gap-0.5">
          <Link
            href={review.placeSlug ? `/place/${review.placeSlug}` : "#"}
            className="text-foreground font-semibold underline-offset-4 hover:underline"
          >
            {review.place}
          </Link>
          <div className="text-sm">{review.category}</div>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <RatingStars rating={review.rating} size={16} />
        </div>

        <p className="text-foreground mt-1 line-clamp-2">{review.review}</p>

        <div className="mt-3">
          <ReviewReactions
            reviewId={review.reviewId || String(review.id)}
            initialCounts={{
              like: review.likes,
              love: review.loves,
              meh: review.mehs,
              dislike: review.dislikes,
            }}
            initialMyReaction={review.myReaction ?? null}
            compact
            size={16}
          />
        </div>
      </div>
    </div>
  );
}
