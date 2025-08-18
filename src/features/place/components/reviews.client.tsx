"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, Heart, Meh, ThumbsDown, Reply } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { RatingStars } from "@/components/ui/rating-stars";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import { setReviewReaction, type ReactionType } from "@/lib/supabase/queries";

export interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    body?: string | null;
    created_at: string;
    my_reaction?: ReactionType | null;
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
      is_owner?: boolean;
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
  const router = useRouter();
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postBusy, setPostBusy] = useState(false);
  const [replies, setReplies] = useState(review.replies || []);
  const propReaction = review.my_reaction ?? null;
  const [myReaction, setMyReaction] = useState<ReactionType | null>(
    propReaction,
  );
  const [optimisticCounts, setOptimisticCounts] = useState<
    Record<Exclude<ReactionType, null>, number>
  >({
    like: review.review_stats?.likes_count ?? 0,
    love: review.review_stats?.loves_count ?? 0,
    meh: review.review_stats?.mehs_count ?? 0,
    dislike: review.review_stats?.dislikes_count ?? 0,
  });

  // Keep local state in sync with parent-provided my_reaction (e.g., after client hydration)
  useEffect(() => {
    if (propReaction !== myReaction) {
      setMyReaction(propReaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propReaction, review.id]);

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

      {/* Title removed from schema; show only body */}

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
                    unoptimized={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {user ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(
            [
              { key: "like", icon: ThumbsUp },
              { key: "love", icon: Heart },
              { key: "meh", icon: Meh },
              { key: "dislike", icon: ThumbsDown },
            ] as const
          ).map(({ key, icon: Icon }) => {
            const active = myReaction === (key as ReactionType);
            const count = optimisticCounts[key as Exclude<ReactionType, null>];
            return (
              <button
                key={key}
                type="button"
                className={`border-border inline-flex items-center gap-1 rounded-xl border px-3 py-1 ${active ? "bg-muted" : ""}`}
                onClick={async () => {
                  if (!user) {
                    const redirect =
                      typeof window !== "undefined"
                        ? window.location.pathname
                        : "/";
                    router.push(
                      `/login?redirect=${encodeURIComponent(redirect)}`,
                    );
                    return;
                  }
                  const wasActive = myReaction === (key as ReactionType);
                  const next: ReactionType | null = wasActive
                    ? null
                    : (key as ReactionType);
                  setMyReaction(next);
                  setOptimisticCounts((prev) => {
                    const delta: Record<string, number> = {
                      like: 0,
                      love: 0,
                      meh: 0,
                      dislike: 0,
                    };
                    if (myReaction) delta[myReaction] -= 1;
                    if (next) delta[next] += 1;
                    return {
                      like: prev.like + delta.like,
                      love: prev.love + delta.love,
                      meh: prev.meh + delta.meh,
                      dislike: prev.dislike + delta.dislike,
                    };
                  });
                  try {
                    await setReviewReaction({
                      reviewId: review.id,
                      reactionType: next,
                      userId: user.id,
                    });
                  } catch {
                    // revert
                    setMyReaction(
                      wasActive ? (key as ReactionType) : myReaction,
                    );
                    setOptimisticCounts((prev) => {
                      const delta: Record<string, number> = {
                        like: 0,
                        love: 0,
                        meh: 0,
                        dislike: 0,
                      };
                      if (next) delta[next] -= 1;
                      if (myReaction) delta[myReaction] += 1;
                      return {
                        like: prev.like + delta.like,
                        love: prev.love + delta.love,
                        meh: prev.meh + delta.meh,
                        dislike: prev.dislike + delta.dislike,
                      };
                    });
                  }
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{count}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                const redirect =
                  typeof window !== "undefined"
                    ? window.location.pathname
                    : "/";
                router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
                return;
              }
              setIsReplying((v) => !v);
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-xl px-2 py-1 hover:underline"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </button>
        </div>
      ) : null}

      {isReplying ? (
        <div className="mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={postBusy || !replyText.trim()}
              onClick={async () => {
                if (!user || !replyText.trim()) return;
                setPostBusy(true);
                try {
                  const { data: inserted, error } = await supabase
                    .from("review_replies")
                    .insert({
                      review_id: review.id,
                      author_id: user.id,
                      body: replyText.trim(),
                    })
                    .select(
                      "id, review_id, author_id, body, created_at, updated_at",
                    )
                    .single();
                  if (error) throw error;
                  let authorProfile:
                    | {
                        id: string;
                        username?: string | null;
                        full_name?: string | null;
                        avatar_url?: string | null;
                      }
                    | undefined;
                  const { data: prof } = await supabase
                    .from("profiles")
                    .select("id, username, full_name, avatar_url")
                    .eq("id", user.id)
                    .maybeSingle();
                  if (prof) authorProfile = prof as typeof authorProfile;
                  setReplies((prev) => [
                    ...prev,
                    {
                      ...(inserted as unknown as NonNullable<
                        ReviewItemProps["review"]["replies"]
                      >[number]),
                      author: authorProfile,
                      photos: [],
                    },
                  ]);
                  setReplyText("");
                  setIsReplying(false);
                } catch {
                  // silently ignore for now; could add toast later
                } finally {
                  setPostBusy(false);
                }
              }}
              className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm disabled:opacity-60"
            >
              {postBusy ? "Posting..." : "Post"}
            </button>
            <button
              type="button"
              disabled={postBusy}
              onClick={() => {
                setIsReplying(false);
                setReplyText("");
              }}
              className="rounded-md border px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {replies && replies.length ? (
        <div className="mt-6 space-y-3">
          {replies.map((rep) => {
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
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${rep.author?.username || rep.author?.id || "user"}`}
                        className="text-foreground font-medium hover:underline"
                      >
                        {rname}
                      </Link>
                      {rep.is_owner && (
                        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          Owner
                        </span>
                      )}
                    </div>
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

export default function ReviewsClient({
  reviews,
}: {
  reviews: ReviewItemProps["review"][];
}) {
  const { user } = useAuth();
  const [myMap, setMyMap] = useState<
    Map<string, "like" | "love" | "meh" | "dislike">
  >(new Map());

  const pendingIds = useMemo(
    () =>
      reviews
        .filter(
          (r) => (r as { my_reaction?: string | null }).my_reaction == null,
        )
        .map((r) => r.id),
    [reviews],
  );

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      if (!pendingIds.length) return;
      try {
        const { data } = await supabase
          .from("review_reactions")
          .select("review_id, reaction_type")
          .eq("user_id", user.id)
          .in("review_id", pendingIds);
        if (data && data.length) {
          const m = new Map<string, "like" | "love" | "meh" | "dislike">();
          for (const row of data as Array<{
            review_id: string;
            reaction_type: "like" | "love" | "meh" | "dislike";
          }>) {
            m.set(row.review_id, row.reaction_type);
          }
          setMyMap(m);
        }
      } catch {}
    })();
  }, [user?.id, pendingIds]);

  if (!reviews.length)
    return <div className="text-muted-foreground">No reviews yet.</div>;

  return (
    <div className="divide-border space-y-12 divide-y">
      {reviews.map((r) => {
        const withServer = r as ReviewItemProps["review"] & {
          my_reaction?: "like" | "love" | "meh" | "dislike" | null;
        };
        const override = myMap.get(r.id) ?? withServer.my_reaction ?? null;
        const next: ReviewItemProps["review"] & {
          my_reaction?: typeof override;
        } = {
          ...r,
          my_reaction: override,
        };
        return <ReviewItem key={r.id} review={next} />;
      })}
    </div>
  );
}
