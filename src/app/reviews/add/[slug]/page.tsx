import { notFound, redirect } from "next/navigation";
import {
  getPlaceBySlugWithDetails,
  getMenuItemsForPlace,
  getPhotoCategories,
} from "@/lib/supabase/queries";
import { Suspense } from "react";
import AddReviewForm from "./review-form.client";

export const dynamic = "force-dynamic";

export default async function AddReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return notFound();

  const [menuItems, categories] = await Promise.all([
    getMenuItemsForPlace(place.id).catch(() => []),
    getPhotoCategories().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">
        Write a review for {place.name}
      </h1>
      <Suspense fallback={null}>
        {/* Client component handles auth gate and submission */}
        <AddReviewForm
          placeId={place.id}
          placeSlug={place.slug}
          menuItems={menuItems}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
