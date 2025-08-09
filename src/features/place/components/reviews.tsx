"use client";

import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Heart, Meh, ThumbsDown, Reply } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { RatingStars } from "@/components/ui/rating-stars";

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    body?: string | null;
    created_at: string;
    author?: {
      id: string;
      full_name?: string | null;
      username?: string | null;
      avatar_url?: string | null;
    };
    review_stats?: {
      likes_count: number;
      loves_count: number;
      mehs_count: number;
      dislikes_count: number;
      total_reactions: number;
    };
    photos?: { id: string; file_path: string; alt_text?: string | null }[];
    replies?: Array<{
      id: string;
      review_id: string;
      author_id: string;
      body: string;
      created_at: string;
      updated_at: string;
      author?: {
        id: string;
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
      };
      photos?: { id: string; file_path: string; alt_text?: string | null }[];
    }>;
  };
}

function ReviewItem({ review }: ReviewItemProps) {
  const name = review.author?.full_name || review.author?.username || "User";
  const avatar =
    review.author?.avatar_url ||
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=128&auto=format&fit=crop&q=60";
  const profileHref = `/profile/${review.author?.username || review.author?.id || "user"}`;

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3.5">
        <Link
          href={profileHref}
          className="relative h-12 w-12 overflow-hidden rounded-full"
        >
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="(max-width: 640px) 48px, 48px"
            className="object-cover"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link
              href={profileHref}
              className="text-foreground font-medium hover:underline"
            >
              {name}
            </Link>
            <div className="flex items-center gap-2">
              <RatingStars rating={review.rating} size={16} />
              <span className="text-sm font-medium">{review.rating}</span>
            </div>
          </div>
          <div className="text-muted-foreground mt-0.5 text-sm">
            {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="text-foreground mt-3 font-medium">{review.title}</h4>
      )}

      {review.body ? (
        <p className="text-foreground mt-3 max-w-prose">{review.body}</p>
      ) : null}

      {review.photos && review.photos.length ? (
        <div className="mt-3">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-2 flex">
              {review.photos.slice(0, 12).map((p) => (
                <div
                  key={p.id}
                  className="relative ml-2 h-28 w-40 shrink-0 overflow-hidden rounded-xl"
                >
                  <Image
                    src={p.file_path}
                    alt={p.alt_text || "review photo"}
                    fill
                    sizes="(max-width: 640px) 160px, 160px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="border-border inline-flex items-center gap-1 rounded-xl border px-3 py-1"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{review.review_stats?.likes_count ?? 0}</span>
        </button>
        <button
          type="button"
          className="border-border inline-flex items-center gap-1 rounded-xl border px-3 py-1"
        >
          <Heart className="h-3.5 w-3.5" />
          <span>{review.review_stats?.loves_count ?? 0}</span>
        </button>
        <button
          type="button"
          className="border-border inline-flex items-center gap-1 rounded-xl border px-3 py-1"
        >
          <Meh className="h-3.5 w-3.5" />
          <span>{review.review_stats?.mehs_count ?? 0}</span>
        </button>
        <button
          type="button"
          className="border-border inline-flex items-center gap-1 rounded-xl border px-3 py-1"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{review.review_stats?.dislikes_count ?? 0}</span>
        </button>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1 rounded-xl px-2 py-1 hover:underline"
        >
          <Reply className="h-3.5 w-3.5" />
          <span>Reply</span>
        </button>
      </div>

      {review.replies && review.replies.length ? (
        <div className="mt-6 space-y-3">
          {review.replies.map((rep) => {
            const rname =
              rep.author?.full_name || rep.author?.username || "User";
            const ravatar =
              rep.author?.avatar_url ||
              "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=64&auto=format&fit=crop&q=60";

            return (
              <div
                key={rep.id}
                className="border-border flex gap-3.5 border-l-2 pb-4 pl-3.5"
              >
                <Link
                  href={`/profile/${rep.author?.username || rep.author?.id || "user"}`}
                  className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-full"
                >
                  <Image
                    src={ravatar}
                    alt={rname}
                    fill
                    sizes="(max-width: 640px) 48px, 48px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div>
                    <Link
                      href={`/profile/${rep.author?.username || rep.author?.id || "user"}`}
                      className="text-foreground font-medium hover:underline"
                    >
                      {rname}
                    </Link>
                    <div className="mt-0.5 text-sm">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-foreground mt-2 max-w-prose">
                    {rep.body}
                  </div>
                  {rep.photos && rep.photos.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {rep.photos.slice(0, 6).map((p) => (
                        <div
                          key={p.id}
                          className="relative aspect-square overflow-hidden rounded-3xl"
                        >
                          <Image
                            src={p.file_path}
                            alt={p.alt_text || "reply photo"}
                            fill
                            sizes="(max-width: 640px) 96px, 96px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function Reviews({
  reviews,
}: {
  reviews: ReviewItemProps["review"][];
}) {
  if (!reviews.length)
    return <div className="text-muted-foreground">No reviews yet.</div>;

  return (
    <div className="divide-border space-y-12 divide-y">
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
    </div>
  );
}
