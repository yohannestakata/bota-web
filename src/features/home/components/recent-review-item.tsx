"use client";

import Image from "next/image";
import { RatingStars } from "@/components/ui/rating-stars";
import Link from "next/link";
import { ThumbsUp, Heart, Meh, ThumbsDown, User } from "lucide-react";

export interface RecentReviewItemData {
  id: number;
  placeSlug?: string;
  authorHandle?: string;
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
        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
          <User size={12} className="text-muted-foreground" />
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
          className="rounded-lg object-cover"
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

        <div className="mt-3 flex items-center gap-1">
          <span
            className="hover:bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm"
            title="Like"
          >
            <ThumbsUp size={16} />
            <span className=""> {review.likes}</span>
          </span>
          <span
            className="hover:bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm"
            title="Love"
          >
            <Heart size={16} />
            <span className=""> {review.loves}</span>
          </span>
          <span
            className="hover:bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm"
            title="Meh"
          >
            <Meh size={16} />
            <span className=""> {review.mehs}</span>
          </span>
          <span
            className="hover:bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm"
            title="Dislike"
          >
            <ThumbsDown size={16} />
            <span className=""> {review.dislikes}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
