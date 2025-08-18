"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth-context";
import { ThumbsUp, Heart, Meh, ThumbsDown } from "lucide-react";
import { setReviewReaction } from "@/lib/supabase/queries";
import { getUserReactionForReview } from "@/lib/supabase/queries/reviews";

type ReactionType = "like" | "love" | "meh" | "dislike";
import AuthGateDialog from "@/components/ui/auth-gate-dialog.client";

export default function ReviewReactions({
  reviewId,
  initialCounts,
  initialMyReaction = null,
  size = 16,
  compact = false,
}: {
  reviewId: string;
  initialCounts: { like: number; love: number; meh: number; dislike: number };
  initialMyReaction?: ReactionType | null;
  size?: number;
  compact?: boolean;
}) {
  const { user } = useAuth();
  // router not needed; AuthGateDialog handles redirect

  const [myReaction, setMyReaction] = useState<ReactionType | null>(
    initialMyReaction,
  );
  const [counts, setCounts] = useState({ ...initialCounts });
  const [showAuth, setShowAuth] = useState(false);

  // Fetch user's reaction if not provided initially
  useEffect(() => {
    if (initialMyReaction === null && user) {
      console.log("[ReviewReactions] fetching my reaction", { reviewId });
      getUserReactionForReview(reviewId)
        .then((reaction) => {
          console.log("[ReviewReactions] my reaction loaded", reaction);
          setMyReaction(reaction);
        })
        .catch((error) => {
          console.error("[ReviewReactions] Error fetching reaction:", error);
        });
    }
  }, [reviewId, initialMyReaction, user]);

  const Button = ({
    k,
    Icon,
  }: {
    k: ReactionType;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }) => {
    const active = myReaction === k;
    const count = counts[k];
    return (
      <button
        type="button"
        className={`border-border hover:bg-muted inline-flex min-w-14 cursor-pointer items-center justify-center gap-1 rounded-lg ${
          compact ? "px-2 py-1 text-sm" : "px-3 py-1.5"
        } border ${active ? "bg-muted" : ""}`}
        title={k}
        onClick={async () => {
          if (!user) return setShowAuth(true);
          const wasActive = myReaction === k;
          const next: ReactionType | null = wasActive ? null : k;
          setMyReaction(next);
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
          } catch {
            // revert
            setMyReaction(wasActive ? k : myReaction);
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
        }}
      >
        <Icon
          width={size}
          height={size}
          className={`${active && "text-primary"} ${
            active && k === "love" && "fill-primary"
          }`}
          strokeWidth={active ? 2.5 : 2}
        />
        {!compact ? <span>{count}</span> : null}
      </button>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button k="like" Icon={ThumbsUp} />
        <Button k="love" Icon={Heart} />
        <Button k="meh" Icon={Meh} />
        <Button k="dislike" Icon={ThumbsDown} />
      </div>
      <AuthGateDialog open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
}
