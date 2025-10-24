"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { RatingStars } from "@/components/ui/rating-stars";
import ReviewReactions from "@/features/reviews/components/review-reactions.client";
import Image from "next/image";

export default function ProfileReviewCard({
  reviewId,
  placeSlug,
  placeLabel,
  rating,
  date,
  body,
  photos = [],
  initialReactions,
  initialMyReaction,
}: {
  reviewId: string;
  placeSlug?: string;
  placeLabel: string;
  rating: number;
  date: string;
  body?: string;
  photos?: Array<{
    id: string;
    file_path: string;
    alt_text?: string | null;
    created_at?: string;
  }>;
  initialReactions?: {
    like: number;
    love: number;
    meh: number;
    dislike: number;
  };
  initialMyReaction?: "like" | "love" | "meh" | "dislike" | null;
}) {
  return (
    <div className="border-border h-full border p-6">
      {/* Content */}
      <div className="flex h-full flex-1 flex-col">
        <div className="flex flex-col gap-0.5">
          <Link
            href={placeSlug ? `/place/${placeSlug}` : "#"}
            className="text-foreground font-bold underline-offset-4 hover:underline"
          >
            {placeLabel}
          </Link>
        </div>

        {body ? (
          <p className="text-foreground mt-2 line-clamp-3">{body}</p>
        ) : null}

        {photos.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="relative aspect-square overflow-hidden"
              >
                <Image
                  src={p.file_path}
                  alt={p.alt_text || "review photo"}
                  fill
                  sizes="(max-width: 640px) 33vw, 96px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-1.5 flex items-center gap-1">
          <RatingStars rating={rating} size={16} />
        </div>

        <div className="mt-2 text-sm">
          {formatDistanceToNowStrict(new Date(date), { addSuffix: true })}
        </div>

        {reviewId ? (
          <div className="mt-3.5 flex flex-1 flex-col justify-end">
            <div>
              <ReviewReactions
                reviewId={reviewId}
                initialCounts={
                  initialReactions || { like: 0, love: 0, meh: 0, dislike: 0 }
                }
                initialMyReaction={initialMyReaction ?? null}
                size={16}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
