import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getPlaceBySlugWithDetails,
  getMenuItemsForPlace,
  getPhotoCategories,
} from "@/lib/supabase/queries";
import { getPlaceAndBranchByBranchSlug } from "@/lib/supabase/queries/places";
import PlacePhotoUpload from "@/features/place/components/place-photo-upload.client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AddPlaceMediaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log("[photos/add] params", { slug });
  const placeBySlug = await getPlaceBySlugWithDetails(slug);
  let branchIdForUpload: string | null = null;
  let resolvedVia: "place" | "branch" | "none" = "none";
  let branchSlugForRedirect: string | null = null;
  let displayPlace: { id: string; name: string; slug: string } | null = null;

  if (placeBySlug) {
    resolvedVia = "place";
    // Prefer main branch id if present for uploads
    branchIdForUpload = (placeBySlug as unknown as { branch_id?: string })
      .branch_id
      ? ((placeBySlug as unknown as { branch_id?: string }).branch_id as string)
      : (placeBySlug.id as string);
    displayPlace = {
      id: placeBySlug.id,
      name: placeBySlug.name,
      slug: placeBySlug.slug,
    };
  } else {
    // Fallback: the provided slug might be a branch slug; resolve parent place
    const viaBranch = await getPlaceAndBranchByBranchSlug(slug).catch(
      () => null,
    );
    if (!viaBranch || !viaBranch.place?.slug) {
      console.warn(
        "[photos/add] place not found for slug (no branch fallback)",
        {
          slug,
        },
      );
      return notFound();
    }
    resolvedVia = "branch";
    displayPlace = {
      id: viaBranch.place.id,
      name: viaBranch.place.name,
      slug: viaBranch.place.slug,
    };
    branchIdForUpload = viaBranch.branch.id;
    branchSlugForRedirect = viaBranch.branch.slug;
  }

  const [menuItems, categories] = await Promise.all([
    getMenuItemsForPlace(branchIdForUpload as string).catch((e) => {
      console.warn("[photos/add] getMenuItemsForPlace error", e);
      return [];
    }),
    getPhotoCategories().catch((e) => {
      console.warn("[photos/add] getPhotoCategories error", e);
      return [];
    }),
  ]);
  console.log("[photos/add] loaded", {
    resolvedVia,
    placeId: displayPlace?.id,
    branchIdForUpload,
    menuItems: Array.isArray(menuItems) ? menuItems.length : 0,
    categories: Array.isArray(categories) ? categories.length : 0,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-4xl">
        Add Photos for{" "}
        <Link
          href={`/place/${displayPlace.slug}`}
          className="font-bold decoration-2 underline-offset-4 hover:underline"
        >
          {" "}
          {displayPlace.name}
        </Link>
      </h1>
      <Suspense fallback={null}>
        <PlacePhotoUpload
          placeId={branchIdForUpload as string}
          placeSlug={displayPlace.slug}
          branchSlug={branchSlugForRedirect ?? undefined}
          menuItems={menuItems}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
