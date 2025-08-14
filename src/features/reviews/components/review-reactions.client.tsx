"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { ThumbsUp, Heart, Meh, ThumbsDown } from "lucide-react";
import { setReviewReaction, type ReactionType } from "@/lib/supabase/queries";
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

  // Fetch current user's reaction if not provided
  useEffect(() => {
    if (!user?.id) return;
    if (initialMyReaction != null) return;
    (async () => {
      try {
        console.log("[ReviewReactions] fetching my reaction", { reviewId });
        const { data, error } = await (
          await import("@/lib/supabase/client")
        ).supabase
          .from("review_reactions")
          .select("reaction_type")
          .eq("user_id", user.id)
          .eq("review_id", reviewId)
          .maybeSingle();
        if (!error && data?.reaction_type) {
          setMyReaction(data.reaction_type as ReactionType);
          console.log(
            "[ReviewReactions] my reaction loaded",
            data.reaction_type,
          );
        }
      } catch (e) {
        console.log("[ReviewReactions] load error", e);
      }
    })();
  }, [user?.id, reviewId, initialMyReaction]);

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
        className={`border-border inline-flex items-center gap-2 rounded-md ${
          compact ? "px-2 py-1 text-sm" : "px-3 py-1"
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
            await setReviewReaction(reviewId, next);
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
        <Icon width={size} height={size} />
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
