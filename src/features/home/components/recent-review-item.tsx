import Image from "next/image";
import { RatingStars } from "@/components/ui/rating-stars";
import Link from "next/link";
import { User } from "lucide-react";
import ReviewReactions from "@/features/reviews/components/review-reactions.client";

export interface RecentReviewItemData {
  id: number;
  reviewId?: string;
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
  reviewPhotos?: Array<{
    id: string;
    file_path: string;
    alt_text?: string;
    created_at: string;
  }>;
  branchPhotos?: Array<{
    id: string;
    file_path: string;
    alt_text?: string;
    created_at: string;
  }>;
}

export default function RecentReviewItem({
  review,
}: {
  review: RecentReviewItemData;
}) {
  return (
    <div className="border-border border p-6">
      <div className="flex items-center gap-3.5">
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
            className="font-bold underline-offset-4 hover:underline"
          >
            {review.user}
          </Link>
          <div className="text-sm">{review.date}</div>
        </div>
      </div>

      <div className="relative mt-3 aspect-video w-full">
        {review.reviewPhotos && review.reviewPhotos.length > 0 ? (
          // Show first review photo
          <Image
            src={review.reviewPhotos[0].file_path}
            alt={review.reviewPhotos[0].alt_text || review.place}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized={false}
          />
        ) : review.branchPhotos && review.branchPhotos.length > 0 ? (
          // Show first branch photo as fallback
          <Image
            src={review.branchPhotos[0].file_path}
            alt={review.branchPhotos[0].alt_text || review.place}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized={false}
          />
        ) : (
          // Fallback to the default image
          <Image
            src={review.image}
            alt={review.place}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized={false}
          />
        )}
      </div>

      <div className="mt-3 flex-1">
        <div className="flex flex-col gap-0.5">
          <Link
            href={review.placeSlug ? `/place/${review.placeSlug}` : "#"}
            className="text-foreground font-bold underline-offset-4 hover:underline"
          >
            {review.place}
          </Link>
          <div className="text-sm">{review.category}</div>
        </div>

        <p className="text-foreground mt-2 line-clamp-2">{review.review}</p>

        <div className="mt-1.5 flex items-center gap-1">
          <RatingStars rating={review.rating} size={16} />
        </div>

        {review.reviewId && review.reviewId !== "" && (
          <div className="mt-3.5">
            <ReviewReactions
              reviewId={review.reviewId}
              initialCounts={{
                like: review.likes,
                love: review.loves,
                meh: review.mehs,
                dislike: review.dislikes,
              }}
              size={16}
            />
          </div>
        )}
      </div>
    </div>
  );
}
