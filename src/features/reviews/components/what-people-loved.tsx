import Image from "next/image";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatTimeAgo } from "@/lib/utils/timeago";

export interface LovedReview {
  id: string;
  rating: number;
  body?: string | null;
  created_at: string;
  author?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  review_stats?: {
    total_reactions: number;
    likes_count: number;
    loves_count: number;
    mehs_count: number;
    dislikes_count: number;
  };
}

export default function WhatPeopleLoved({
  reviews,
}: {
  reviews: LovedReview[];
}) {
  const popular = (reviews || [])
    .slice()
    .sort((a, b) => {
      const ra = a.review_stats?.total_reactions || 0;
      const rb = b.review_stats?.total_reactions || 0;
      if (rb !== ra) return rb - ra;
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return bt - at;
    })
    .slice(0, 5);

  return (
    <aside className="col-span-12 lg:col-span-5">
      <div className="text-xl font-semibold">What people loved</div>
      {popular.length === 0 ? (
        <div className="text-muted-foreground text-sm">No reviews yet</div>
      ) : (
        <ul className="mt-6 space-y-8">
          {popular.map((r) => {
            const avatar = r.author?.avatar_url;
            const name = r.author?.full_name || r.author?.username || "User";
            const timeAgo = formatTimeAgo(r.created_at);
            return (
              <li key={r.id} className="flex gap-3.5">
                <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm font-semibold">
                      {name.toString().trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{name}</div>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {r.review_stats?.total_reactions || 0} reactions
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {timeAgo}
                    </span>
                  </div>
                  {r.body ? (
                    <p className="mt-2 line-clamp-2 leading-6">{r.body}</p>
                  ) : null}
                  <RatingStars rating={r.rating} size={14} className="mt-1" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
