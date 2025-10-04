import { notFound } from "next/navigation";
import {
  getPlaceBySlugWithDetails,
  getMenuItemsForPlace,
  getPhotoCategories,
  getReviewsForPlace,
  getPlacePageData,
} from "@/lib/supabase/queries";
import { Suspense } from "react";
import AddReviewForm from "@/features/reviews/components/add-review-form.client";
import AddReviewHeader from "@/features/reviews/components/add-review-header";
import WhatPeopleLoved from "@/features/reviews/components/what-people-loved";

export const dynamic = "force-dynamic";

export default async function AddReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return notFound();

  const [menuItemsRaw, categories, reviewsRawInitial] = await Promise.all([
    getMenuItemsForPlace(place.branch_id || place.id).catch(() => []),
    getPhotoCategories().catch(() => []),
    getReviewsForPlace(place.branch_id || place.id, 12).catch(() => []),
  ]);
  let menuItems = menuItemsRaw as Array<{ id: string; name: string }>;
  let reviewsRaw = reviewsRawInitial as Array<{
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
  }>;

  // Fallback: if menu or reviews are empty for this branch, try consolidated page data
  if ((menuItems?.length ?? 0) === 0 || (reviewsRaw?.length ?? 0) === 0) {
    try {
      const pageData = await getPlacePageData(place.slug, null, {
        reviewLimit: 12,
        photoLimit: 0,
      });
      if (pageData) {
        if ((menuItems?.length ?? 0) === 0) {
          const flatMenu = (pageData.place.menu?.items || []).map((it) => ({
            id: String(it.id),
            name: String(it.name),
          }));
          if (flatMenu.length) menuItems = flatMenu;
        }
        if ((reviewsRaw?.length ?? 0) === 0) {
          // Normalize RPC reviews to match getReviewsForPlace shape
          reviewsRaw = (pageData.reviews || []).map((r) => ({
            id: r.id,
            rating: r.rating,
            body: r.body,
            created_at: r.created_at,
            author: r.author,
            review_stats: {
              total_reactions: r.stats?.total_reactions || 0,
              likes_count: r.stats?.likes_count || 0,
              loves_count: r.stats?.loves_count || 0,
              mehs_count: r.stats?.mehs_count || 0,
              dislikes_count: r.stats?.dislikes_count || 0,
            },
          }));
        }
      }
    } catch (e) {
      // swallow fallback errors
    }
  }

  const popular = (reviewsRaw || [])
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-24">
        <div className="col-span-12 lg:col-span-7">
          <AddReviewHeader placeSlug={place.slug} placeName={place.name} />
          <Suspense fallback={null}>
            {/* Client component handles auth gate and submission */}
            <AddReviewForm
              placeId={place.branch_id || place.id}
              placeSlug={place.slug}
              menuItems={menuItems}
              categories={categories}
            />
          </Suspense>
        </div>
        <div className="col-span-12 mt-12 md:mt-0 lg:col-span-5">
          <WhatPeopleLoved
            reviews={
              popular as unknown as Array<{
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
              }>
            }
          />
        </div>
      </div>
    </div>
  );
}
