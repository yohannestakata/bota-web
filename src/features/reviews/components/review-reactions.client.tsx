"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth-context";
import { ThumbsUp, Heart, Meh, ThumbsDown } from "lucide-react";
import { setReviewReaction } from "@/lib/supabase/queries";
import {
  getUserReactionForReview,
  getReviewStats,
} from "@/lib/supabase/queries/reviews";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AuthGate from "@/components/ui/auth-gate";

type ReactionType = "like" | "love" | "meh" | "dislike";

// Custom hook for fetching user reaction with React Query
function useUserReaction(
  reviewId: string,
  initialMyReaction?: ReactionType | null,
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-reaction", reviewId, user?.id],
    queryFn: () => getUserReactionForReview(reviewId),
    enabled: !!user, // Only run query if user is logged in
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    initialData: initialMyReaction,
  });
}

export default function ReviewReactions({
  reviewId,
  initialCounts,
  size = 16,
  compact = false,
  initialMyReaction,
}: {
  reviewId: string;
  initialCounts: { like: number; love: number; meh: number; dislike: number };
  size?: number;
  compact?: boolean;
  initialMyReaction?: ReactionType | null;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: myReaction } = useUserReaction(reviewId, initialMyReaction);
  const [counts, setCounts] = useState({ ...initialCounts });

  const Button = ({
    k,
    Icon,
  }: {
    k: ReactionType;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }) => {
    const active = myReaction === k;
    const count = counts[k];

    const handleClick = async () => {
      if (!user) return; // AuthGate will handle this

      const wasActive = myReaction === k;
      const next: ReactionType | null = wasActive ? null : k;

      // Optimistic update
      queryClient.setQueryData(["user-reaction", reviewId, user.id], next);
      setCounts((prev) => ({
        ...prev,
        [k]: prev[k] + (wasActive ? -1 : 1),
        ...(wasActive
          ? {}
          : myReaction
            ? { [myReaction]: prev[myReaction] - 1 }
            : {}),
      }));

      try {
        await setReviewReaction({
          reviewId,
          reactionType: next,
          userId: user.id,
        });
        // Refetch the latest counts from the server
        const freshStats = await getReviewStats(reviewId);
        setCounts({
          like: freshStats.likes_count,
          love: freshStats.loves_count,
          meh: freshStats.mehs_count,
          dislike: freshStats.dislikes_count,
        });
        // Invalidate and refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: ["user-reaction", reviewId],
        });
      } catch {
        // revert optimistic update
        queryClient.setQueryData(
          ["user-reaction", reviewId, user.id],
          wasActive ? k : myReaction,
        );
        setCounts((prev) => ({
          ...prev,
          [k]: prev[k] + (wasActive ? 1 : -1),
          ...(wasActive
            ? {}
            : myReaction
              ? { [myReaction]: prev[myReaction] + 1 }
              : {}),
        }));
      }
    };

    return (
      <AuthGate
        title="Sign in to react"
        description="You need an account to react to reviews."
      >
        <button
          type="button"
          className={`border-border hover:bg-muted inline-flex min-w-14 flex-1 cursor-pointer items-center justify-center gap-1 ${
            compact ? "px-2 py-1 text-sm" : "px-3 py-1.5"
          } border ${active ? "bg-muted" : ""}`}
          title={k}
          onClick={handleClick}
        >
          <Icon
            width={size}
            height={size}
            className={`${active && "text-primary"}`}
            strokeWidth={active ? 3 : 2}
          />
          {!compact ? <span>{count}</span> : null}
        </button>
      </AuthGate>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button k="like" Icon={ThumbsUp} />
      <Button k="love" Icon={Heart} />
      <Button k="meh" Icon={Meh} />
      <Button k="dislike" Icon={ThumbsDown} />
    </div>
  );
}
