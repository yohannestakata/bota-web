"use client";
import { useRef, useState } from "react";
import RecentReviewItem, {
  type RecentReviewItemData,
} from "./recent-review-item";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronDown } from "lucide-react";

export default function RecentReviewsLoadMore({
  show = true,
  filter = "recent",
  lat,
  lon,
  seenIds = [],
}: {
  show?: boolean;
  filter?: "recent" | "trending" | "nearby" | string | undefined;
  lat?: number;
  lon?: number;
  seenIds?: string[];
}) {
  type ApiPhoto = {
    id: string;
    file_path: string;
    alt_text?: string | null;
    created_at: string;
  };
  type ApiRecentRow = {
    review_id: string;
    created_at: string;
    branch_slug?: string | null;
    is_main_branch?: boolean | null;
    place_name?: string | null;
    place_slug?: string | null;
    author_full_name?: string | null;
    author_username?: string | null;
    author_id?: string | null;
    author_avatar_url?: string | null;
    category_name?: string | null;
    rating: number;
    body?: string | null;
    likes_count?: number | null;
    loves_count?: number | null;
    mehs_count?: number | null;
    dislikes_count?: number | null;
    my_reaction?: "like" | "love" | "meh" | "dislike" | null;
    display_image?: string | null;
    review_photos?: ApiPhoto[] | null;
    branch_photos?: ApiPhoto[] | null;
  };

  const [items, setItems] = useState<RecentReviewItemData[]>([]);
  const [offset, setOffset] = useState(() => seenIds?.length ?? 0);
  const [loading, setLoading] = useState(false);
  const seenRef = useRef<Set<string>>(new Set((seenIds || []).map(String)));

  if (!show) return null;

  function transformRows(rows: ApiRecentRow[]): RecentReviewItemData[] {
    return rows.map((review) => {
      const placeName = review.place_name || "Restaurant Name";
      const category = review.category_name || "Restaurant";
      const userName =
        review.author_full_name || review.author_username || "User";
      const avatarUrl = review.author_avatar_url || undefined;
      const rid = String(review.review_id ?? "");
      const idNum = rid
        ? parseInt(rid.replace(/-/g, "").substring(0, 8), 16)
        : Math.floor(Math.random() * 1e8);
      const date = formatDistanceToNowStrict(new Date(review.created_at), {
        addSuffix: true,
      });
      const image = review.display_image || "";

      const reviewPhotos = (review.review_photos || []).map((p) => ({
        id: p.id,
        file_path: p.file_path,
        alt_text: p.alt_text ?? undefined,
        created_at: p.created_at,
      }));
      const branchPhotos = (review.branch_photos || []).map((p) => ({
        id: p.id,
        file_path: p.file_path,
        alt_text: p.alt_text ?? undefined,
        created_at: p.created_at,
      }));

      return {
        id: idNum,
        reviewId: rid,
        placeSlug: review.place_slug || "",
        branchSlug: review.branch_slug || undefined,
        isMainBranch: review.is_main_branch ?? undefined,
        authorHandle: review.author_username || review.author_id || "",
        avatarUrl,
        place: placeName,
        category,
        rating: review.rating,
        review: review.body || "Great experience!",
        user: userName,
        date,
        likes: review.likes_count || 0,
        loves: review.loves_count || 0,
        mehs: review.mehs_count || 0,
        dislikes: review.dislikes_count || 0,
        myReaction: review.my_reaction ?? null,
        comments: 0,
        image,
        reviewPhotos,
        branchPhotos,
      } satisfies RecentReviewItemData;
    });
  }

  async function loadMore(batch = 12) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter: (filter || "recent").toString(),
        limit: String(batch),
        offset: String(offset),
      });
      if (filter === "nearby" && lat != null && lon != null) {
        params.set("lat", String(lat));
        params.set("lon", String(lon));
      }
      const res = await fetch(`/api/reviews/recent?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { items?: ApiRecentRow[] };
      const nextRaw = json.items || [];
      const next = transformRows(nextRaw);
      if (process.env.NODE_ENV !== "production") {
        console.log("[recent-load-more] fetched", {
          filter,
          offset,
          count: nextRaw.length,
          sampleRaw: nextRaw.slice(0, 2),
        });
      }
      setItems((prev) => {
        const existing = new Set(prev.map((r) => String(r.reviewId)));
        // Merge with server-sent initial IDs
        for (const id of seenRef.current) existing.add(String(id));
        const deduped = next.filter((r) => !existing.has(String(r.reviewId)));
        // Update global seenRef with newly accepted IDs
        for (const r of deduped) seenRef.current.add(String(r.reviewId));
        return [...prev, ...deduped];
      });
      setOffset((o) => o + next.length);
    } finally {
      setLoading(false);
    }
  }

  const isSupported =
    !filter ||
    filter === "recent" ||
    filter === "trending" ||
    filter === "nearby";
  if (!isSupported) return null;

  return (
    <>
      {items.length > 0 && (
        <div className="mt-5 max-w-6xl">
          <div className="columns-1 md:columns-2 lg:columns-3 [column-gap:1.5rem]">
            {items.map((review) => (
              <div key={String(review.reviewId)} className="mb-6 break-inside-avoid">
                <RecentReviewItem review={review} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => loadMore(12)}
          disabled={loading}
          className="border-border flex w-full cursor-pointer items-center justify-center gap-2 border-y p-4 text-sm font-semibold underline-offset-4 hover:underline disabled:opacity-60"
        >
          {loading ? "Loading…" : "See more"}
          {!loading && <ChevronDown size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}
