"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import ProfileReviewCard from "@/features/profile/components/profile-review-card";
import type { ReviewsByAuthorClient } from "@/lib/supabase/queries/reviews";
import { getReviewsByAuthor } from "@/lib/supabase/queries";
import { getPhotosByAuthor } from "@/lib/supabase/queries";

type ReviewItem = ReviewsByAuthorClient;

type PhotoItem = {
  id: string;
  file_path: string;
  alt_text?: string | null;
  created_at: string;
  review_id?: string;
};

export default function ProfileTabs({
  userId,
  initialReviews,
  initialPhotos,
  reviewsPageSize = 8,
  photosPageSize = 24,
}: {
  userId: string;
  initialReviews: ReviewItem[];
  initialPhotos: PhotoItem[];
  reviewsPageSize?: number;
  photosPageSize?: number;
}) {
  const [active, setActive] = useState<"reviews" | "photos">("reviews");
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos || []);
  const [reviewsOffset, setReviewsOffset] = useState(reviews.length);
  const [photosOffset, setPhotosOffset] = useState(photos.length);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Ensure initial state is set on mount
    setReviews(initialReviews || []);
    setPhotos(initialPhotos || []);
    setReviewsOffset((initialReviews || []).length);
    setPhotosOffset((initialPhotos || []).length);
    console.log("[ProfileTabs] mount", {
      userId,
      initialReviews: (initialReviews || []).length,
      initialPhotos: (initialPhotos || []).length,
    });
  }, [initialReviews, initialPhotos, userId]);

  const loadMoreReviews = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      console.log("[ProfileTabs] loadMoreReviews ->", {
        userId,
        limit: reviewsPageSize,
        offset: reviewsOffset,
      });
      const next = await getReviewsByAuthor(
        userId,
        reviewsPageSize,
        reviewsOffset,
      );
      setReviews((prev) => [...prev, ...((next || []) as ReviewItem[])]);
      setReviewsOffset((prev) => prev + (next?.length || 0));
      console.log("[ProfileTabs] loadMoreReviews <-", {
        received: next?.length || 0,
        newTotal: reviews.length + (next?.length || 0),
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMorePhotos = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      console.log("[ProfileTabs] loadMorePhotos ->", {
        userId,
        limit: photosPageSize,
        offset: photosOffset,
      });
      const next = await getPhotosByAuthor(
        userId,
        photosPageSize,
        photosOffset,
      );
      setPhotos((prev) => [...prev, ...((next || []) as PhotoItem[])]);
      setPhotosOffset((prev) => prev + (next?.length || 0));
      console.log("[ProfileTabs] loadMorePhotos <-", {
        received: next?.length || 0,
        newTotal: photos.length + (next?.length || 0),
      });
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="border-border bg-background sticky top-14 z-[9998] mt-6 border-b md:top-18">
        <div className="no-scrollbar flex h-12 items-center gap-2 overflow-x-auto px-4 md:h-14">
          <button
            type="button"
            onClick={() => {
              console.log("[ProfileTabs] tab -> reviews");
              setActive("reviews");
            }}
            className={`px-3 py-1.5 text-sm font-medium ${active === "reviews" ? "bg-muted" : "hover:bg-muted"}`}
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("[ProfileTabs] tab -> photos");
              setActive("photos");
            }}
            className={`px-3 py-1.5 text-sm font-medium ${active === "photos" ? "bg-muted" : "hover:bg-muted"}`}
          >
            Photos
          </button>
        </div>
      </div>

      {active === "reviews" ? (
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Recent reviews</h2>
          {reviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews yet.</div>
          ) : (
            <>
              <ul className="grid gap-4 md:grid-cols-3">
                {reviews.map((r) => {
                  const placeSlug =
                    (r as unknown as { place_slug?: string }).place_slug ||
                    r.place?.slug ||
                    "";
                  const placeName =
                    (r as unknown as { place_name?: string }).place_name ||
                    r.place?.name ||
                    "Place";
                  const branchName = (r as unknown as { branch_name?: string })
                    .branch_name;
                  const label =
                    branchName && branchName !== placeName
                      ? `${placeName} (${branchName})`
                      : placeName;
                  const stats = (
                    r as unknown as {
                      stats?: {
                        total_reactions: number;
                        likes_count: number;
                        loves_count: number;
                        mehs_count: number;
                        dislikes_count: number;
                      };
                    }
                  ).stats;
                  const myReaction =
                    (
                      r as unknown as {
                        my_reaction?:
                          | "like"
                          | "love"
                          | "meh"
                          | "dislike"
                          | null;
                      }
                    ).my_reaction ?? null;
                  return (
                    <li key={r.id}>
                      <ProfileReviewCard
                        reviewId={r.id}
                        placeSlug={placeSlug}
                        placeLabel={label}
                        rating={r.rating}
                        date={new Date(r.created_at).toLocaleDateString()}
                        body={r.body || ""}
                        photos={(r.photos || []).map((p) => ({
                          id: p.id,
                          file_path: p.file_path,
                          alt_text: p.alt_text || undefined,
                          created_at: r.created_at,
                        }))}
                        initialReactions={{
                          like: stats?.likes_count || 0,
                          love: stats?.loves_count || 0,
                          meh: stats?.mehs_count || 0,
                          dislike: stats?.dislikes_count || 0,
                        }}
                        initialMyReaction={myReaction}
                      />
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMoreReviews}
                  disabled={loadingMore}
                  className="border-border hover:bg-muted rounded border px-4 py-2 text-sm"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Recent photos</h2>
          {photos.length === 0 ? (
            <div className="text-muted-foreground">No photos yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative aspect-square overflow-hidden"
                  >
                    <Image
                      src={normalizeImageSrc(p.file_path)}
                      alt={p.alt_text || "user photo"}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMorePhotos}
                  disabled={loadingMore}
                  className="border-border hover:bg-muted rounded border px-4 py-2 text-sm"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
