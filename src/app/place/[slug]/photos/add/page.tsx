import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getPlaceBySlugWithDetails,
  getMenuItemsForPlace,
  getPhotoCategories,
} from "@/lib/supabase/queries";
import PlacePhotoUpload from "@/features/place/components/place-photo-upload.client";

export const dynamic = "force-dynamic";

export default async function AddPlaceMediaPage({
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">
        Add Photos or Video for {place.name}
      </h1>
      <Suspense fallback={null}>
        <PlacePhotoUpload
          placeId={place.id}
          placeSlug={place.slug}
          menuItems={menuItems}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
