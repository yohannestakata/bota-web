import { notFound } from "next/navigation";
import {
  getMenuItemsForPlace,
  getPhotoCategories,
  getReviewsForPlace,
} from "@/lib/supabase/queries";
import { getPlaceAndBranchByBranchSlug } from "@/lib/supabase/queries/places";
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
  const { slug } = await params; // now branch slug
  const ref = await getPlaceAndBranchByBranchSlug(slug);
  if (!ref) return notFound();
  const place = {
    id: ref.place.id,
    name: ref.place.name,
    slug: ref.place.slug,
  };
  const branchId = ref.branch.id;

  const [menuItemsRaw, categories, reviewsRawInitial] = await Promise.all([
    getMenuItemsForPlace(branchId).catch(() => []),
    getPhotoCategories().catch(() => []),
    getReviewsForPlace(branchId, 12).catch(() => []),
  ]);
  const menuItems = menuItemsRaw as Array<{ id: string; name: string }>;
  const reviewsRaw = reviewsRawInitial as Array<{
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

  // No fallback: page uses branch context; leave lists as-is on empty

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
          <AddReviewHeader
            placeSlug={place.slug}
            placeName={place.name}
            branchName={ref.branch.name}
            branchSlug={ref.branch.slug}
            isMainBranch={ref.branch.isMain}
          />
          <Suspense fallback={null}>
            {/* Client component handles auth gate and submission */}
            <AddReviewForm
              placeId={branchId}
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
