import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPlaceBySlugWithDetails } from "@/lib/supabase/queries";
import RequestEditForm from "@/features/place/components/request-edit-form.client";

export const dynamic = "force-dynamic";

export default async function RequestEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">
        Request an Edit for {place.name}
      </h1>
      <Suspense fallback={null}>
        <RequestEditForm placeId={place.id} placeSlug={place.slug} />
      </Suspense>
    </div>
  );
}

