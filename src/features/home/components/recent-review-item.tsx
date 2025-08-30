"use client";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { RatingStars } from "@/components/ui/rating-stars";
import Link from "next/link";
import { User } from "lucide-react";
import ReviewReactions from "@/features/reviews/components/review-reactions.client";
import { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import useEmblaCarousel from "embla-carousel-react";

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
  myReaction?: "like" | "love" | "meh" | "dislike" | null;
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
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const photos = useMemo(
    () =>
      (review.reviewPhotos && review.reviewPhotos.length
        ? review.reviewPhotos
        : review.branchPhotos || []) || [],
    [review.reviewPhotos, review.branchPhotos],
  );
  const openDialogAt = useCallback(
    (idx: number) => {
      setStartIndex(idx);
      setOpen(true);
    },
    [setOpen, setStartIndex],
  );
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
        {photos.length > 0 ? (
          <button
            type="button"
            onClick={() => openDialogAt(0)}
            className="absolute inset-0"
            aria-label="View photos"
          >
            <Image
              src={normalizeImageSrc(photos[0].file_path)}
              alt={photos[0].alt_text || review.place}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              unoptimized={false}
            />
          </button>
        ) : (
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
              initialMyReaction={review.myReaction ?? null}
            />
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen} size="5xl">
        <GalleryDialogContent
          photos={photos}
          place={review.place}
          reviewText={review.review}
          startIndex={startIndex}
        />
      </Dialog>
    </div>
  );
}

function GalleryDialogContent({
  photos,
  place,
  startIndex = 0,
}: {
  photos: NonNullable<RecentReviewItemData["reviewPhotos"]>;
  place: string;
  reviewText: string;
  startIndex?: number;
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    startIndex,
    loop: true,
  });
  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3 md:p-4">
      <div className="col-span-12 h-full md:col-span-9">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative aspect-video min-w-0 shrink-0 grow-0 basis-full"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={normalizeImageSrc(p.file_path)}
                    alt={p.alt_text || place}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="bg-muted object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 overflow-y-scroll md:col-span-3">
        <div className="grid grid-cols-5 gap-1 md:grid-cols-2">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className="border-border relative aspect-square overflow-hidden border"
              onClick={() => embla?.scrollTo(idx)}
              aria-label={`Go to image ${idx + 1}`}
            >
              <Image
                src={normalizeImageSrc(p.file_path)}
                alt={p.alt_text || place}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
